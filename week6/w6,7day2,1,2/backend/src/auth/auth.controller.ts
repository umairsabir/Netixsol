import { Controller, Post, Body, Get, UseGuards, Request, Res, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(res: Response, tokens: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(registerDto);
    this.setAuthCookies(res, tokens);
    return tokens; // Return everything (user + tokens)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(loginDto);
    this.setAuthCookies(res, tokens);
    return tokens; // Return everything (user + tokens)
  }

  @Post('refresh')
  async refresh(@Request() req: any, @Body('refreshToken') bodyToken: string, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token || bodyToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokens = await this.authService.refreshTokens(payload.sub, refreshToken);
      this.setAuthCookies(res, tokens);
      return tokens; // Return new tokens
    } catch {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);
    this.clearAuthCookies(res);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = await this.authService.getProfile(req.user.id);
    return user;
  }

  // --- OAuth 2.0 Routes ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: any, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthLogin(req.user);
    this.setAuthCookies(res, tokens);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    return res.redirect(`${frontendUrl}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Request() req: any, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthLogin(req.user);
    this.setAuthCookies(res, tokens);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    return res.redirect(`${frontendUrl}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`);
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordAuthRedirect(@Request() req: any, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthLogin(req.user);
    this.setAuthCookies(res, tokens);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    return res.redirect(`${frontendUrl}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`);
  }
}



