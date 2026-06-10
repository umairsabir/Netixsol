import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Role } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    let user;
    if (existingUser) {
      // If user exists but has no password (likely from OAuth), allow setting one
      if (!existingUser.passwordHash) {
        user = await this.usersService.setPassword(existingUser._id.toString(), registerDto.password);
      } else {
        throw new ConflictException('User with this email already exists');
      }
    } else {
      // New user creation
      user = await this.usersService.create({
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: registerDto.password,
        role: Role.USER,
      });
    }
    
    await this.usersService.recordLogin(user._id.toString(), 'email');
    
    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);
    return tokens;
  }


  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials'); // User exists but has no password (social account)
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.recordLogin(user._id.toString(), 'email');

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);
    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(refreshToken, salt);
    const user = await this.usersService.findById(userId);
    if (user) {
      user.refreshToken = hash;
      await user.save();
    }
  }

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points || 0,
      avatar: user.avatar,
      loginActivity: user.loginActivity,
      authIdentities: user.authIdentities
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const user = await this.usersService.findById(userId);
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' })
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: userId,
        name: user?.name,
        email,
        role,
        points: user?.points || 0,
        avatar: user?.avatar,
        loginActivity: user?.loginActivity,
        authIdentities: user?.authIdentities
      }
    };
  }

  async validateOAuthLogin(profile: any) {
    const { provider, providerId, email, name, avatar } = profile;

    // 1. Try to find user by provider ID
    let user = await this.usersService.findByProviderId(provider, providerId);

    if (user) {
      await this.usersService.recordLogin(user._id.toString(), provider);
      return this.issueOAuthTokens(user);
    }

    // 2. If email exists, link the account
    if (email) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        await this.usersService.addAuthIdentity(user._id.toString(), provider, providerId);
        await this.usersService.recordLogin(user._id.toString(), provider);
        return this.issueOAuthTokens(user);
      }
    }

    // 3. Otherwise create a new user safely without a password
    user = await this.usersService.create({
      provider,
      providerId,
      email: email || `${providerId}@${provider}.local`, // Safe fallback if provider doesn't give email
      name: name || 'User',
      avatar,
      role: Role.USER
    });

    await this.usersService.recordLogin(user._id.toString(), provider);
    return this.issueOAuthTokens(user);
  }

  private async issueOAuthTokens(user: any) {
    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);
    return tokens;
  }
}
