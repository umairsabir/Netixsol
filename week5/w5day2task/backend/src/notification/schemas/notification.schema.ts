import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true, enum: ['comment', 'reply', 'like', 'follow'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  comment: Types.ObjectId | null;

  @Prop({ default: false })
  read: boolean;

  @Prop({ required: true })
  message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
