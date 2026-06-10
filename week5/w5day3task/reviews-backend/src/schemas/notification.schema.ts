import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  sender: Types.ObjectId;

  @Prop({ required: true, enum: ['review', 'reply', 'like', 'price_change', 'stock_change'] })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: false })
  productId: Types.ObjectId;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
