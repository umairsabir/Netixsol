import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CarDocument = Car & Document;

export enum CarStatus {
  PENDING = 'pending',
  LIVE = 'live',
  SOLD = 'sold',
  ENDED = 'ended',
}

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true })
  title: string;

  @Prop({ unique: true })
  lotNumber: string;

  @Prop({ required: true })
  make: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  description: string;

  @Prop()
  vin: string;

  @Prop()
  mileage: number;

  @Prop()
  engineSize: string;

  @Prop()
  paint: string;

  @Prop()
  hasGccSpecs: boolean;

  @Prop()
  noteworthyFeatures: string;

  @Prop()
  accidentHistory: string;

  @Prop()
  fullServiceHistory: string;

  @Prop()
  hasBeenModified: boolean;

  @Prop({ required: true, min: 0 })
  startingBid: number;

  @Prop({ default: 0 })
  currentBid: number;

  @Prop({ default: 100 })
  minIncrement: number;

  @Prop({ default: CarStatus.LIVE, enum: CarStatus })
  status: CarStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop()
  auctionEndDate: Date;

  @Prop({ default: 0 })
  bidCount: number;
}

export const CarSchema = SchemaFactory.createForClass(Car);
