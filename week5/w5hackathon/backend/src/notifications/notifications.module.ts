import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BidsGateway } from './bids.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [BidsGateway, NotificationsService],
  exports: [BidsGateway, NotificationsService],
})
export class NotificationsModule {}
