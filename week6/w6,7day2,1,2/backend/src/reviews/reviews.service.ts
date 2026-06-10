import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(productId: string, userId: string, rating: number, comment: string): Promise<Review> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyReviewed = await this.reviewModel.findOne({ product: productId, user: userId });
    if (alreadyReviewed) {
      throw new BadRequestException('Product already reviewed');
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new BadRequestException('Invalid rating');
    }

    // Create the review
    const review = await this.reviewModel.create({
      product: new Types.ObjectId(productId),
      user: new Types.ObjectId(userId),
      name: user.name,
      rating: ratingNum,
      comment,
    });

    // Recalculate and update product metadata
    const reviews = await this.reviewModel.find({ product: new Types.ObjectId(productId) });
    let numReviews = 0;
    let ratingAvg = 0;

    if (reviews.length > 0) {
      numReviews = reviews.length;
      ratingAvg = reviews.reduce((acc, item) => (item.rating || 0) + acc, 0) / reviews.length;
    }

    await this.productModel.findByIdAndUpdate(productId, {
      numReviews,
      rating: ratingAvg,
    });

    return review;
  }

  async findByProduct(productId: string): Promise<Review[]> {
    if (!Types.ObjectId.isValid(productId)) {
      return [];
    }
    return this.reviewModel.find({ product: new Types.ObjectId(productId) }).sort({ createdAt: -1 });
  }
}
