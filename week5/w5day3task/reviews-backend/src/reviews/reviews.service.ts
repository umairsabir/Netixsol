import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from '../schemas/review.schema';
import { Notification } from '../schemas/notification.schema';
import { User } from '../schemas/user.schema';
import { Product } from '../schemas/product.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private notificationsGateway: NotificationsGateway
  ) {}

  async createReview(userId: string, productId: string, rating: number, comment: string) {
    // 1. Verify product exists
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Create review
    let review = new this.reviewModel({
      product: new Types.ObjectId(productId),
      user: new Types.ObjectId(userId),
      rating,
      comment,
    });
    await review.save();

    // 3. Populate user details
    review = await review.populate('user', 'name email role');

    // 4. Broadcast new review to all users via Sockets
    this.notificationsGateway.broadcastNewReview({
      type: 'new-review',
      review,
      productName: product.name,
    });

    // 5. Optionally log general notification in database (e.g. for admins/users interested)
    return review;
  }

  async addReply(userId: string, userName: string, reviewId: string, comment: string) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const reply = {
      user: new Types.ObjectId(userId),
      name: userName,
      comment,
      createdAt: new Date(),
    };

    review.replies.push(reply as any);
    await review.save();

    const populatedReview = await review.populate([
      { path: 'user', select: 'name email role' },
      { path: 'replies.user', select: 'name email role' }
    ]);

    // Notify review owner if reply is from someone else
    if (review.user.toString() !== userId) {
      const product = await this.productModel.findById(review.product);
      const title = 'New Reply on Your Review';
      const message = `${userName} replied to your review on ${product ? product.name : 'a product'}: "${comment.substring(0, 30)}..."`;

      const notification = new this.notificationModel({
        recipient: review.user,
        sender: new Types.ObjectId(userId),
        type: 'reply',
        title,
        message,
        productId: review.product,
      });
      await notification.save();

      // Emit real-time Socket.IO notification to review owner
      this.notificationsGateway.sendDirectNotification(review.user.toString(), {
        _id: notification._id,
        title,
        message,
        type: 'reply',
        productId: review.product,
        createdAt: notification.createdAt,
        isRead: false,
      });
    }

    return populatedReview;
  }

  async toggleLike(userId: string, userName: string, reviewId: string) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const userObjId = new Types.ObjectId(userId);
    const index = review.likes.findIndex((id) => id.toString() === userId);
    let liked = false;

    if (index === -1) {
      review.likes.push(userObjId);
      liked = true;
    } else {
      review.likes.splice(index, 1);
    }

    await review.save();

    // If liked, notify the review owner (only if it's someone else liking it)
    if (liked && review.user.toString() !== userId) {
      const product = await this.productModel.findById(review.product);
      const title = 'Review Liked/Upvoted';
      const message = `${userName} liked your review on ${product ? product.name : 'a product'}!`;

      const notification = new this.notificationModel({
        recipient: review.user,
        sender: userObjId,
        type: 'like',
        title,
        message,
        productId: review.product,
      });
      await notification.save();

      this.notificationsGateway.sendDirectNotification(review.user.toString(), {
        _id: notification._id,
        title,
        message,
        type: 'like',
        productId: review.product,
        createdAt: notification.createdAt,
        isRead: false,
      });
    }

    return { reviewId, likes: review.likes, liked };
  }

  async getReviewsByProduct(productId: string) {
    return this.reviewModel
      .find({ product: new Types.ObjectId(productId) })
      .populate('user', 'name email role')
      .populate('replies.user', 'name email role')
      .sort({ createdAt: -1 });
  }

  async deleteReview(userId: string, role: string, reviewId: string) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only review owner or admin/superadmin can delete review
    const isAdmin = ['admin', 'superadmin'].includes(role);
    if (review.user.toString() !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }

    await this.reviewModel.findByIdAndDelete(reviewId);

    // If deleted by Admin/Superadmin, notify the author
    if (review.user.toString() !== userId && isAdmin) {
      const product = await this.productModel.findById(review.product);
      const title = 'Review Moderated';
      const message = `Your review on ${product ? product.name : 'a product'} was deleted by an admin for violating guidelines.`;

      const notification = new this.notificationModel({
        recipient: review.user,
        sender: new Types.ObjectId(userId),
        type: 'review',
        title,
        message,
        productId: review.product,
      });
      await notification.save();

      this.notificationsGateway.sendDirectNotification(review.user.toString(), {
        _id: notification._id,
        title,
        message,
        type: 'review',
        productId: review.product,
        createdAt: notification.createdAt,
        isRead: false,
      });
    }

    return { success: true };
  }
}
