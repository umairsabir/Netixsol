import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Reply {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);

@Schema({ timestamps: true })
export class Review extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [ReplySchema], default: [] })
  replies: Reply[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
