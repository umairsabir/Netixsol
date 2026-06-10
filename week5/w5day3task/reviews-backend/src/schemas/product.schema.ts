import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  subtitle: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 'bag' })
  unit: string;

  @Prop({ required: true })
  image: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isOrganic: boolean;

  @Prop({ required: true })
  collectionName: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
