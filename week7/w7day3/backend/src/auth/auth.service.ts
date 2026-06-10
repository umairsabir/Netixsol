import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateJwt(user: User): string {
    const payload = { sub: user.id, email: user.email, name: user.name };
    return this.jwtService.sign(payload);
  }
}
