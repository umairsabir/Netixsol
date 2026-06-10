import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerInfoDocument = PlayerInfo & Document;

@Schema({ timestamps: true })
export class PlayerInfo {
  @Prop({ required: true, unique: true })
  playerId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  country: string;
}

export const PlayerInfoSchema = SchemaFactory.createForClass(PlayerInfo);

PlayerInfoSchema.index({ name: 'text', fullName: 'text' });
