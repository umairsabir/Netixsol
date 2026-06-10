import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ userId: 1, createdAt: -1 });
