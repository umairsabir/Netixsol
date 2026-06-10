import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export class RecipeItem {
  @Prop({ type: Types.ObjectId, ref: 'RawMaterial', required: true })
  rawMaterialId: Types.ObjectId;

  @Prop({ required: true, min: 0.001 })
  quantity: number;
}

@Schema({ _id: false })
export class RecipeItemSubdoc extends RecipeItem {}

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category?: Types.ObjectId;

  @Prop({ type: [RecipeItemSubdoc], default: [] })
  recipe: RecipeItem[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
