import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createNotification(data: {
    recipient: string;
    sender: string;
    type: string;
    comment?: string;
    message: string;
  }): Promise<Notification> {
    const newNotif = new this.notificationModel({
      recipient: new Types.ObjectId(data.recipient),
      sender: new Types.ObjectId(data.sender),
      type: data.type,
      comment: data.comment ? new Types.ObjectId(data.comment) : null,
      message: data.message,
      read: false,
    });
    const saved = await newNotif.save();
    
    // Populate sender info for high-quality frontend rendering
    const populated = await saved.populate([
      { path: 'sender', select: 'username profilePicture' },
      { path: 'comment', select: 'content' }
    ]);
    
    // Dispatch via Websocket Gateway
    this.eventsGateway.sendPersonalNotification(data.recipient, populated);

    return populated;
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ recipient: new Types.ObjectId(userId) })
      .populate('sender', 'username profilePicture')
      .populate('comment', 'content')
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const updated = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), recipient: new Types.ObjectId(userId) },
      { $set: { read: true } },
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundException('Notification not found');
    }
    return updated;
  }

  async markAllAsRead(userId: string): Promise<any> {
    return this.notificationModel.updateMany(
      { recipient: new Types.ObjectId(userId), read: false },
      { $set: { read: true } }
    ).exec();
  }
}
