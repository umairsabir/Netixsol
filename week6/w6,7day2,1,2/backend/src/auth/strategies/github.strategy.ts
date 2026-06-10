import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || 'placeholder_client_id',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || 'placeholder_client_secret',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:4000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    const { username, displayName, photos, emails } = profile;
    
    // GitHub might not return the email in the main profile if it's private,
    // but the 'user:email' scope usually ensures it's in the emails array.
    const email = emails && emails.length > 0 ? emails[0].value : null;

    const user = {
      provider: 'github',
      providerId: profile.id,
      email: email, 
      name: displayName || username,
      avatar: photos && photos.length > 0 ? photos[0].value : null,
    };
    done(null, user);
  }
}
