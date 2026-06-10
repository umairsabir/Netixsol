import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Evaluation extends Document {
  @Prop({ required: true })
  studentName: string;

  @Prop({ required: true })
  rollNumber: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  remarks: string;

  @Prop({ required: true })
  assignmentPrompt: string;

  @Prop({ required: true })
  mode: string;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
