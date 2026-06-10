import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../schemas/notification.schema';
import { Review } from '../schemas/review.schema';
import { Product } from '../schemas/product.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private notificationsGateway: NotificationsGateway
  ) {}

  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ recipient: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), recipient: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async processProductUpdateWebhook(productId: string, updatedFields: any) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 1. Get unique users who have previously reviewed this product
    const reviews = await this.reviewModel.find({ product: new Types.ObjectId(productId) });
    const userIds = Array.from(new Set(reviews.map((r) => r.user.toString())));

    if (userIds.length === 0) {
      return { count: 0, message: 'No users to notify' };
    }

    const notificationsToInsert: any[] = [];
    const notificationAlerts: any[] = [];

    // Check price changes
    if (updatedFields.price !== undefined) {
      const title = 'Product Price Update';
      const message = `The price of your reviewed product "${product.name}" has been updated to €${updatedFields.price.toFixed(2)}!`;
      
      userIds.forEach((userId) => {
        notificationsToInsert.push({
          recipient: new Types.ObjectId(userId),
          type: 'price_change',
          title,
          message,
          productId: product._id,
          isRead: false,
        });

        notificationAlerts.push({
          userId,
          alert: { title, message, type: 'price_change', productId: product._id },
        });
      });
    }

    // Check stock changes
    if (updatedFields.variants !== undefined && Array.isArray(updatedFields.variants)) {
      // Find variants that transitioned from 0 stock to >0 stock
      updatedFields.variants.forEach((v: any) => {
        // If stock is back, e.g. stock > 0
        if (v.stock > 0) {
          const title = 'Product Back In Stock';
          const message = `Good news! "${v.label}" variant of "${product.name}" is back in stock with ${v.stock} items!`;

          userIds.forEach((userId) => {
            notificationsToInsert.push({
              recipient: new Types.ObjectId(userId),
              type: 'stock_change',
              title,
              message,
              productId: product._id,
              isRead: false,
            });

            notificationAlerts.push({
              userId,
              alert: { title, message, type: 'stock_change', productId: product._id },
            });
          });
        }
      });
    }

    if (notificationsToInsert.length > 0) {
      const savedNotifications = await this.notificationModel.insertMany(notificationsToInsert);
      
      // Emit via Sockets
      notificationAlerts.forEach((item, index) => {
        const savedNotif = savedNotifications[index];
        this.notificationsGateway.sendDirectNotification(item.userId, {
          _id: savedNotif._id,
          title: item.alert.title,
          message: item.alert.message,
          type: item.alert.type,
          productId: item.alert.productId,
          createdAt: savedNotif.createdAt,
          isRead: false,
        });
      });
    }

    return { count: userIds.length, message: 'Notifications sent successfully' };
  }
}
