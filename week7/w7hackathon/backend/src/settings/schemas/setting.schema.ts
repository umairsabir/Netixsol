import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ timestamps: true })
export class Setting {
  @Prop({ required: true, unique: true, default: 'default' })
  key: string;

  @Prop({ required: true, min: 0, default: 0 })
  taxPercent: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'My POS' })
  storeName: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
