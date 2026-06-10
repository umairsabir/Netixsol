import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from './car.schema';
import { Bid, BidSchema } from '../bids/bid.schema';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Car.name, schema: CarSchema },
      { name: Bid.name, schema: BidSchema }
    ]),
    CloudinaryModule,
    NotificationsModule,
  ],
  providers: [CarsService],
  controllers: [CarsController],
  exports: [CarsService],
})
export class CarsModule {}
