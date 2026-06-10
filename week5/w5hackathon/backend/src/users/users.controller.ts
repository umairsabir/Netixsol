import { Controller, Get, Patch, Body, UseGuards, Request, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateMe(
    @Request() req, 
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.update(req.user.userId, dto, file);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
