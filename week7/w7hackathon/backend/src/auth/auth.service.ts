import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      accessToken: await this.signToken(user),
      expiresIn: this.getExpiresInSeconds(),
      user: this.toSafeUser(user),
    };
  }

  async profile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.toSafeUser(user);
  }

  async refresh(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      accessToken: await this.signToken(user),
      expiresIn: this.getExpiresInSeconds(),
    };
  }

  private signToken(user: UserDocument): Promise<string> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  private toSafeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private getExpiresInSeconds() {
    const raw = process.env.JWT_EXPIRES_IN_SECONDS;
    const parsed = Number(raw ?? 86400);
    return Number.isFinite(parsed) ? parsed : 86400;
  }
}
