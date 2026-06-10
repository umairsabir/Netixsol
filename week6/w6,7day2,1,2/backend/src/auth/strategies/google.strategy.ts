import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder_client_id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder_client_secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      provider: 'google',
      providerId: profile.id,
      email: emails[0].value,
      name: name.givenName ? `${name.givenName} ${name.familyName || ''}`.trim() : profile.displayName,
      avatar: photos && photos.length > 0 ? photos[0].value : null,
    };
    done(null, user);
  }
}
