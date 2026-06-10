import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: any): Promise<any> {
    const { username, email, password, bio, profilePicture } = registerDto;

    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('Email already in use');
    }

    const existingUsername = await this.userService.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userService.create({
      username,
      email,
      password: hashedPassword,
      bio: bio || '',
      profilePicture: profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
    });

    const payload = { sub: newUser._id, username: newUser.username };
    return {
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        profilePicture: newUser.profilePicture,
      },
      token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: any): Promise<any> {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, username: user.username };
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
      token: this.jwtService.sign(payload),
    };
  }

  async validateUserById(userId: string): Promise<any> {
    return this.userService.findById(userId);
  }
}
