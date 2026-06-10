import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // Step 1: Redirect to Google
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport handles the redirect automatically
  }

  // Step 2: Google redirects back here
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: any, @Res() res: ExpressResponse) {
    const token = this.authService.generateJwt(req.user);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const isProduction = process.env.NODE_ENV === 'production' || frontendUrl.includes('https');

    // Store JWT in secure HttpOnly cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${frontendUrl}/dashboard`);
  }

  // Get current logged-in user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return req.user;
  }

  // Logout — clear cookie
  @Post('logout')
  logout(@Res() res: ExpressResponse) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
  }
}
