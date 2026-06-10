import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResearchDocumentDocument = ResearchDocument & Document;

@Schema({ timestamps: true })
export class ResearchDocument {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ default: 0 })
  wordCount: number;
}

export const ResearchDocumentSchema = SchemaFactory.createForClass(ResearchDocument);
