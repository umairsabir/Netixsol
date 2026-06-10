import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, password: hashed });

    const tokens = await this._generateTokens(user._id.toString(), user.email);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user._id.toString(), hashedRefreshToken);
    return { user: { id: user._id.toString(), email: user.email, firstName: user.firstName, lastName: user.lastName }, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this._generateTokens(user._id.toString(), user.email);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user._id.toString(), hashedRefreshToken);
    return { user: { id: user._id.toString(), email: user.email, firstName: user.firstName, lastName: user.lastName }, ...tokens };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user['refreshToken'])
      throw new ForbiddenException('Access denied');

    const match = await bcrypt.compare(refreshToken, user['refreshToken']);
    if (!match) throw new ForbiddenException('Access denied');

    const tokens = await this._generateTokens(user._id.toString(), user.email);
    const hashed = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user._id.toString(), hashed);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out' };
  }

  private async _generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
