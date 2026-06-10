import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-passwordHash').exec();
  }
}
