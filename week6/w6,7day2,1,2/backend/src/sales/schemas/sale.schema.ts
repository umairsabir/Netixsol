import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleDocument = Sale & Document;

@Schema({ timestamps: true })
export class Sale {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: 'percentage' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: ['all', 'category', 'product'] })
  targetType: 'all' | 'category' | 'product';

  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  targetIds: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
