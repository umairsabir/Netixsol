import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:username')
  async getProfile(@Param('username') username: string) {
    return this.userService.getProfile(username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.userService.findById(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() updateData: { bio?: string; profilePicture?: string }) {
    return this.userService.updateProfile(req.user._id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow/:id')
  async followUser(@Request() req: any, @Param('id') followId: string) {
    return this.userService.followUser(req.user._id, followId);
  }
}
