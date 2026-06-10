import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('DISCORD_CLIENT_ID') || 'placeholder_client_id',
      clientSecret: configService.get<string>('DISCORD_CLIENT_SECRET') || 'placeholder_client_secret',
      callbackURL: configService.get<string>('DISCORD_CALLBACK_URL') || 'http://localhost:4000/auth/discord/callback',
      scope: ['identify', 'email'],
      customHeaders: {
        'User-Agent': 'EcommerceApp (https://my-ecommerce.com, 1.0.0)',
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    const { username, email, avatar, id } = profile;
    const avatarUrl = avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null;

    const user = {
      provider: 'discord',
      providerId: id,
      email: email, 
      name: username,
      avatar: avatarUrl,
    };
    done(null, user);
  }
}
