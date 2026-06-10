import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RawMaterialsService } from '../raw-materials/raw-materials.service';

import { GetProductsFilterDto } from './dto/get-products-filter.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly rawMaterialsService: RawMaterialsService,
  ) {}

  async create(dto: CreateProductDto) {
    const product = await this.productModel.create({
      ...dto,
      category: dto.category ? new Types.ObjectId(dto.category) : undefined,
      recipe: dto.recipe.map((item) => ({
        rawMaterialId: new Types.ObjectId(item.rawMaterialId),
        quantity: item.quantity,
      })),
    });
    return (await product.populate('category')).toObject();
  }

  async findAll(filter?: GetProductsFilterDto) {
    const query: any = {};

    if (filter?.search) {
      query.name = { $regex: filter.search, $options: 'i' };
    }

    if (filter?.category && filter.category !== '' && filter.category !== 'undefined') {
      try {
        const categoryObjectId = new Types.ObjectId(filter.category);
        // Match both ObjectId and string variants to support legacy data
        query.$or = [
          { category: categoryObjectId },
          { category: filter.category },
        ];
      } catch (e) {
        console.error('Invalid Category ID in filter:', filter.category);
      }
    }

    const products = await this.productModel
      .find(query)
      .populate('category')
      .sort({ name: 1 });

    return Promise.all(
      products.map((product) => this.withAvailability(product)),
    );
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).populate('category');
    if (!product) throw new NotFoundException('Product not found');
    return this.withAvailability(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const updateData: any = { ...dto };
    
    if (dto.category === "") {
      updateData.category = null;
    } else if (dto.category) {
      updateData.category = new Types.ObjectId(dto.category);
    }

    if (dto.recipe) {
      updateData.recipe = dto.recipe.map((item) => ({
        rawMaterialId: new Types.ObjectId(item.rawMaterialId),
        quantity: item.quantity,
      }));
    }
    
    const updated = await this.productModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!updated) throw new NotFoundException('Product not found');
    return this.withAvailability(updated);
  }

  async remove(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Product not found');
    return { message: 'Product deleted' };
  }

  async getAllRecipeRawMaterialIds(): Promise<string[]> {
    const products = await this.productModel
      .find()
      .select('recipe.rawMaterialId');
    const ids = products.flatMap((product) =>
      product.recipe.map((item) => item.rawMaterialId.toString()),
    );
    return [...new Set(ids)];
  }

  async withAvailability(product: ProductDocument) {
    const recipe = product.recipe.map((item) => ({
      rawMaterialId: item.rawMaterialId.toString(),
      quantity: item.quantity,
    }));
    const constraints: {
      rawMaterialId: string;
      quantity: number;
      maxUnits: number;
    }[] = [];

    for (const item of recipe) {
      const material = await this.rawMaterialsService.findOne(
        item.rawMaterialId,
      );
      constraints.push({
        rawMaterialId: item.rawMaterialId,
        quantity: item.quantity,
        maxUnits: Math.floor(material.currentStock / item.quantity),
      });
    }

    const limitedBy =
      constraints.sort((a, b) => a.maxUnits - b.maxUnits)[0] ?? null;
    const availableStock = limitedBy?.maxUnits ?? 0;

    return {
      ...product.toObject(),
      availableStock,
      limitedBy: limitedBy
        ? {
            rawMaterialId: limitedBy.rawMaterialId,
            quantityPerUnit: limitedBy.quantity,
          }
        : null,
    };
  }
}
