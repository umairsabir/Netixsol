import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsController } from '../notifications/notifications.controller';
import { NotificationsService } from '../notifications/notifications.service';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Product, ProductSchema } from '../schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ReviewsController, NotificationsController],
  providers: [ReviewsService, NotificationsService, NotificationsGateway],
  exports: [ReviewsService, NotificationsService, NotificationsGateway],
})
export class ReviewsModule {}
