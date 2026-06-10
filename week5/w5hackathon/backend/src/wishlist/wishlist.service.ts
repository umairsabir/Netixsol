import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(@InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>) {}

  async toggleWishlist(userId: string, carId: string) {
    const existing = await this.wishlistModel.findOne({
      user: new Types.ObjectId(userId),
      car: new Types.ObjectId(carId),
    });

    if (existing) {
      await existing.deleteOne();
      return { status: 'removed' };
    }

    await this.wishlistModel.create({
      user: new Types.ObjectId(userId),
      car: new Types.ObjectId(carId),
    });
    return { status: 'added' };
  }

  async getWishlist(userId: string) {
    return this.wishlistModel.find({ user: new Types.ObjectId(userId) }).populate('car');
  }
}
