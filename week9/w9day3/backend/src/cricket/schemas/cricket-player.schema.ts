import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CricketPlayerDocument = CricketPlayer & Document;

@Schema({ timestamps: true })
export class CricketPlayer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['test', 'odi', 't20'] })
  format: string;

  @Prop({ required: true, default: 0 })
  matches: number;

  @Prop({ required: true, default: 0 })
  innings: number;

  @Prop({ required: true, default: 0 })
  runs: number;

  @Prop({ required: true, default: 0 })
  balls_faced: number;

  @Prop({ required: true, default: '0' })
  high_score: string;

  @Prop({ required: true, default: 0 })
  average: number;

  @Prop({ required: true, default: 0 })
  strike_rate: number;

  @Prop({ required: true, default: 0 })
  hundreds: number;

  @Prop({ required: true, default: 0 })
  fifties: number;

  @Prop({ required: true, default: 0 })
  wickets: number;
}

export const CricketPlayerSchema = SchemaFactory.createForClass(CricketPlayer);
