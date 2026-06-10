import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QueryTraceDocument = QueryTrace & Document;

export interface TraceStep {
  step: string;
  timestamp: Date;
  input?: any;
  output?: any;
  duration?: number;
}

export interface SubQuestion {
  id: string;
  text: string;
}

export interface RankedDocument {
  id: string;
  title: string;
  topic: string;
  content: string;
  score: number;
}

export interface Summary {
  documentId: string;
  title: string;
  summary: string;
  keySentences: string[];
}

export interface Contradiction {
  between: string[];
  description: string;
}

@Schema({ timestamps: true })
export class QueryTrace {
  @Prop({ required: true })
  queryId: string;

  @Prop({ required: true })
  originalQuestion: string;

  @Prop({ type: [{ step: String, timestamp: Date, input: Object, output: Object, duration: Number }], default: [] })
  steps: TraceStep[];

  @Prop({ type: [{ id: String, text: String }] })
  subQuestions: SubQuestion[];

  @Prop({ type: [{ id: String, title: String, topic: String, content: String, score: Number }] })
  rankedDocuments: RankedDocument[];

  @Prop({ type: [{ documentId: String, title: String, summary: String, keySentences: [String] }] })
  summaries: Summary[];

  @Prop({ type: [{ between: [String], description: String }] })
  contradictions: Contradiction[];

  @Prop()
  finalAnswer: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'error';

  @Prop()
  error?: string;
}

export const QueryTraceSchema = SchemaFactory.createForClass(QueryTrace);
