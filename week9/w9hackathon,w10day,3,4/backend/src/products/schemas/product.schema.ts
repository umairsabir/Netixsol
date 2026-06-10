import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ trim: true, default: '' })
  imageUrl: string;

  @Prop({ type: Number, default: 0 })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Text index for title-based search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Regular indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ tags: 1 });
