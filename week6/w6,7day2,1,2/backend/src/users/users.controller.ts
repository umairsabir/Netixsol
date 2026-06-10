import { Controller, Post, Body, UseGuards, Get, Delete, Param, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.SUPER_ADMIN)
  @Post()
  async createUser(@Body() createUserDto: RegisterDto) {
    // Only Super Admin can create other administrative or specific role users
    return this.usersService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash: createUserDto.password,
      role: createUserDto.role || Role.USER,
    });
  }

  @Roles(Role.SUPER_ADMIN)
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    const { name } = body;
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    
    if (!user) throw new UnauthorizedException('User not found');
    
    if (name) user.name = name;
    await user.save();
    
    return { 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points
      }
    };
  }

  @Patch('change-password')
  async changePassword(@Req() req: any, @Body() body: any) {
    const { oldPassword, newPassword } = body;
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    
    if (!user) throw new UnauthorizedException('User not found');
    
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid old password');
    
    const salt = await bcrypt.genSalt();
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.passwordHash = newHashedPassword;
    await user.save();
    
    return { message: 'Password updated successfully' };
  }
}
