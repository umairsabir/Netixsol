import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RawMaterialDocument = HydratedDocument<RawMaterial>;

@Schema({ timestamps: true })
export class RawMaterial {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ required: true, min: 0 })
  currentStock: number;

  @Prop({ required: true, min: 0, default: 0 })
  minStockAlert: number;

  @Prop({ trim: true })
  unit: string;
}

export const RawMaterialSchema = SchemaFactory.createForClass(RawMaterial);
