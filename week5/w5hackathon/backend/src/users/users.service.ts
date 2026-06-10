import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinary: CloudinaryService,
  ) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password');
  }

  async updateRefreshToken(userId: string, token: string | null) {
    return this.userModel.findByIdAndUpdate(userId, { refreshToken: token });
  }

  async update(userId: string, data: Partial<User>, file?: Express.Multer.File): Promise<UserDocument> {
    if (file) {
      data.profilePicture = await this.cloudinary.uploadImage(file);
    }
    return this.userModel.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  }
}
