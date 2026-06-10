import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SummaryDocument = Summary & Document;

@Schema({ timestamps: true })
export class Summary {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ default: 0 })
  turnCount: number;
}

export const SummarySchema = SchemaFactory.createForClass(Summary);
