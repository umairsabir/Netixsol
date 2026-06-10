import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentDocument = DocumentItem & Document;

@Schema({ timestamps: true })
export class DocumentItem {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  path: string;

  @Prop()
  cloudinaryUrl?: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ default: 'processing' })
  status: 'processing' | 'ready' | 'error';

  @Prop({ type: Object })
  analysis: {
    type?: string;
    summary?: string;
    highlights?: string[];
    entities?: string[];
    sections?: Array<{ title: string; content: string }>;
  };

  @Prop()
  fullText?: string;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentItem);
