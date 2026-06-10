import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerMatchDocument = PlayerMatch & Document;

@Schema({ timestamps: true })
export class PlayerMatch {
  @Prop({ required: true })
  playerId: number;

  @Prop({ required: true })
  matchDate: Date;

  @Prop({ required: true, enum: ['Test', 'ODI', 'T20I'] })
  format: string;

  @Prop({ required: true })
  team: string;

  @Prop({ required: true })
  opposition: string;

  @Prop({ required: true })
  venue: string;

  @Prop({ required: true })
  matchResult: string;

  @Prop({ default: 0 })
  innings: number;

  @Prop({ default: '' })
  dismissal: string;

  @Prop({ default: 0 })
  runs: number;

  @Prop({ default: 0 })
  minutes: number;

  @Prop({ default: 0 })
  ballsFaced: number;

  @Prop({ default: 0 })
  fours: number;

  @Prop({ default: 0 })
  sixes: number;

  @Prop({ default: 0 })
  strikeRate: number;

  @Prop({ default: 0 })
  inns: number;

  @Prop({ default: 0 })
  overs: number;

  @Prop({ default: 0 })
  maidens: number;

  @Prop({ default: 0 })
  runsConceded: number;

  @Prop({ default: 0 })
  wickets: number;

  @Prop({ default: 0 })
  economy: number;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: 0 })
  dull: number;

  @Prop({ default: 0 })
  byes: number;

  @Prop({ default: '' })
  matchId: string;

  @Prop({ default: 0 })
  season: number;

  @Prop({ default: 0 })
  runOuts: number;

  @Prop({ default: 0 })
  hatTricks: number;

  @Prop({ default: 0 })
  roCatches: number;

  @Prop({ default: 0 })
  roDirect: number;

  @Prop({ default: 0 })
  roStumped: number;
}

export const PlayerMatchSchema = SchemaFactory.createForClass(PlayerMatch);
