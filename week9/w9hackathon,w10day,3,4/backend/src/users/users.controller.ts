import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body(new ValidationPipe()) dto: SignupDto) {
    return this.usersService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ValidationPipe()) dto: LoginDto) {
    return this.usersService.login(dto);
  }
}
