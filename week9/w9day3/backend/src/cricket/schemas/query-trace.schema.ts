import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QueryTraceDocument = QueryTrace & Document;

@Schema({ timestamps: true })
export class QueryTrace {
  @Prop({ required: true, unique: true })
  queryId: string;

  @Prop({ required: true })
  originalQuestion: string;

  @Prop({ type: [{ step: String, timestamp: Date, input: Object, output: Object, duration: Number }] })
  steps: Array<{
    step: string;
    timestamp: Date;
    input?: any;
    output?: any;
    duration?: number;
  }>;

  @Prop({ type: Boolean })
  isRelevant: boolean;

  @Prop({ type: Object })
  generatedQuery?: any;

  @Prop({ type: Array })
  queryResults?: any[];

  @Prop()
  formattedAnswer?: string;

  @Prop({ type: String, default: 'completed' })
  status: string;
}

export const QueryTraceSchema = SchemaFactory.createForClass(QueryTrace);
