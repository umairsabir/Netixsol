import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(data: { userId: string; title: string; message: string; type?: string; link?: string }) {
    const notification = await this.notificationModel.create({
      ...data,
      userId: new Types.ObjectId(data.userId) as any
    });
    
    // Also emit via websocket for real-time
    this.gateway.sendNotification(data.userId, notification);
    
    return notification;
  }

  async findAllForUser(userId: string) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) } as any)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) } as any,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false } as any,
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false } as any);
  }
}
