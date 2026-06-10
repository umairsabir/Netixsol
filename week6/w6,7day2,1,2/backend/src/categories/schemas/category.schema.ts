import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: String, default: null })
  imageUrl: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId | null;

  // 0 = main, 1 = sub
  @Prop({ default: 0 })
  level: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Auto-set level based on parentId before save
CategorySchema.pre('save', function() {
  const doc = this as any;
  if (doc.isModified('name') || doc.isModified('parentId')) {
    doc.level = doc.parentId ? 1 : 0;
  }
});
