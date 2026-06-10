import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll() {
    return this.categoryModel.find().sort({ level: 1, name: 1 }).lean();
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findMainCategories() {
    return this.categoryModel.find({ level: 0 }).sort({ name: 1 }).lean();
  }

  async findSubcategories(parentId: string) {
    return this.categoryModel.find({ parentId: new Types.ObjectId(parentId) }).sort({ name: 1 }).lean();
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
  }) {
    const existing = await this.categoryModel.findOne({ slug: data.slug });
    if (existing) throw new ConflictException('A category with this slug already exists');

    const category = new this.categoryModel({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      imageUrl: data.imageUrl || null,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : null,
    });
    return category.save();
  }

  async update(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    parentId: string | null;
  }>) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    if (data.slug && data.slug !== category.slug) {
      const existing = await this.categoryModel.findOne({ slug: data.slug });
      if (existing) throw new ConflictException('A category with this slug already exists');
    }

    Object.assign(category, {
      ...data,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : data.parentId === null ? null : category.parentId,
    });
    return category.save();
  }

  async remove(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryModel.deleteOne({ _id: id });
    return { message: 'Category deleted' };
  }
}
