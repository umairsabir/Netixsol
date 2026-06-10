import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  categoryId: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Number, default: null })
  stock: number | null;

  // Simple color & size options (no price change)
  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ type: [String], default: [] })
  sizes: string[];

  // Map of color name to its specific images
  @Prop({ type: Map, of: [String], default: {} })
  colorImages: Map<string, string[]>;

  // Loyalty points features
  @Prop({ type: String, enum: ['money', 'points', 'hybrid'], default: 'money' })
  purchaseType: 'money' | 'points' | 'hybrid';

  @Prop({ type: Number, default: null })
  pointsPrice: number | null;

  @Prop({ type: Number, default: 0 })
  pointsReward: number;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  numReviews: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
