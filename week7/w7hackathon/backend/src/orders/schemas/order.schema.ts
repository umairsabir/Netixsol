import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  lineTotal: number;
}

@Schema({ _id: false })
export class OrderItemSubdoc extends OrderItem {}

@Schema({ _id: false })
export class MaterialUsageSubdoc {
  @Prop({ type: Types.ObjectId, ref: 'RawMaterial', required: true })
  rawMaterialId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  quantity: number;
}

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ unique: true, required: true })
  orderNumber: string;

  @Prop({ type: [OrderItemSubdoc], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ enum: ['completed', 'voided'], default: 'completed' })
  status: 'completed' | 'voided';

  @Prop({ type: [MaterialUsageSubdoc], default: [] })
  materialUsage: MaterialUsageSubdoc[];

  @Prop()
  voidedBy?: string;

  @Prop()
  voidReason?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
