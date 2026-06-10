import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) 
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    userId: string | null;
    title: string;
    message: string;
    type?: string;
    link?: string;
  }): Promise<NotificationDocument> {
    const notificationData: any = { ...data };
    if (data.userId) {
      notificationData.userId = new Types.ObjectId(data.userId);
    } else {
      delete notificationData.userId;
    }
    return this.notificationModel.create(notificationData);
  }

  async findAllByUser(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({
        $or: [
          { userId: new Types.ObjectId(userId) },
          { userId: { $exists: false } },
          { userId: null },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndUpdate(notificationId, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }
}
