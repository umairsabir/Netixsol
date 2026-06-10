import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamMatchDocument = TeamMatch & Document;

@Schema({ timestamps: true })
export class TeamMatch {
  @Prop({ required: true })
  team: string;

  @Prop({ required: true })
  opposition: string;

  @Prop({ required: true })
  matchDate: Date;

  @Prop({ required: true, enum: ['Test', 'ODI', 'T20I'] })
  format: string;

  @Prop({ required: true })
  venue: string;

  @Prop({ required: true })
  result: string;

  @Prop({ default: '' })
  margin: string;

  @Prop({ default: '' })
  toss: string;

  @Prop({ default: '' })
  battingInnings: string;

  @Prop({ default: 0 })
  runs: number;

  @Prop({ default: 0 })
  wickets: number;

  @Prop({ default: 0 })
  overs: number;

  @Prop({ default: 0 })
  runRate: number;
}

export const TeamMatchSchema = SchemaFactory.createForClass(TeamMatch);
