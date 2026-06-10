import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StockHistoryDocument = HydratedDocument<StockHistory>;

@Schema({ timestamps: true })
export class StockHistory {
  @Prop({
    type: Types.ObjectId,
    ref: 'RawMaterial',
    required: true,
    index: true,
  })
  rawMaterialId: Types.ObjectId;

  @Prop({ required: true })
  delta: number;

  @Prop({ required: true, min: 0 })
  beforeStock: number;

  @Prop({ required: true, min: 0 })
  afterStock: number;

  @Prop({
    required: true,
    enum: ['order_deduct', 'order_void_restore', 'restock'],
  })
  reason: 'order_deduct' | 'order_void_restore' | 'restock';

  @Prop()
  orderId?: string;

  @Prop()
  note?: string;

  @Prop()
  actorId?: string;
}

export const StockHistorySchema = SchemaFactory.createForClass(StockHistory);
