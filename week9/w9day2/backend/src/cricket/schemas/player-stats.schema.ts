import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerStatsDocument = PlayerStats & Document;

@Schema({ timestamps: true })
export class PlayerStats {
  @Prop({ required: true })
  playerId: number;

  @Prop({ required: true })
  year: number;

  @Prop({ default: 0 })
  matches: number;

  @Prop({ default: 0 })
  runs: number;

  @Prop({ default: '' })
  highScore: string;

  @Prop({ default: 0 })
  average: number;

  @Prop({ default: 0 })
  hundreds: number;

  @Prop({ default: 0 })
  fifties: number;

  @Prop({ default: 0 })
  wickets: number;

  @Prop({ default: '' })
  bestBowling: string;

  @Prop({ default: 0 })
  bowlingAverage: number;

  @Prop({ default: 0 })
  catches: number;

  @Prop({ default: 0 })
  stumpings: number;

  @Prop({ default: 0 })
  allRounderRating: number;
}

export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);
