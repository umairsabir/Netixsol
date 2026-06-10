import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async getProfile(username: string): Promise<any> {
    const user = await this.userModel.findOne({ username })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      followers: user.followers,
      following: user.following,
    };
  }

  async updateProfile(userId: string, updateData: { bio?: string; profilePicture?: string }): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    ).select('-password').exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  async followUser(userId: string, followId: string): Promise<{ followed: boolean; followersCount: number }> {
    if (userId === followId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const userToFollow = await this.userModel.findById(followId);
    const currentUser = await this.userModel.findById(userId);

    if (!userToFollow || !currentUser) {
      throw new NotFoundException('User not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const followObjectId = new Types.ObjectId(followId);

    const isFollowing = currentUser.following.includes(followObjectId);

    if (isFollowing) {
      // Unfollow
      await this.userModel.findByIdAndUpdate(userId, { $pull: { following: followObjectId } });
      const updatedFollowed = await this.userModel.findByIdAndUpdate(
        followId,
        { $pull: { followers: userObjectId } },
        { new: true }
      );
      return { followed: false, followersCount: updatedFollowed?.followers.length || 0 };
    } else {
      // Follow
      await this.userModel.findByIdAndUpdate(userId, { $addToSet: { following: followObjectId } });
      const updatedFollowed = await this.userModel.findByIdAndUpdate(
        followId,
        { $addToSet: { followers: userObjectId } },
        { new: true }
      );
      return { followed: true, followersCount: updatedFollowed?.followers.length || 0 };
    }
  }
}
