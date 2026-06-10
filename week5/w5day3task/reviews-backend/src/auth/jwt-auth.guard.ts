import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from '../schemas/user.schema';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production');
      const user = await this.userModel.findById(decoded.id || decoded._id);
      
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      if (user.isBlocked) {
        throw new UnauthorizedException('Your account has been blocked');
      }

      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Session expired or token is invalid');
    }
  }
}
