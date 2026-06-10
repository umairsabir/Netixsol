import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => SalesService))
    private readonly salesService: SalesService,
  ) {}

  private applyDiscount(product: any, sale: any) {
    if (!sale) return product;

    let salePrice = product.price;
    if (sale.discountType === 'percentage') {
      salePrice = product.price * (1 - sale.discountValue / 100);
    } else {
      salePrice = Math.max(0, product.price - sale.discountValue);
    }

    // Use the better discount (lowest price)
    const currentDiscounted = (product.discountedPrice !== undefined && product.discountedPrice !== null) ? product.discountedPrice : product.price;
    product.discountedPrice = Math.min(currentDiscounted, salePrice);
    
    // Ensure discountedPrice is set correctly if it was null/undefined before.
    if ((product.discountedPrice === undefined || product.discountedPrice === null) || (product.discountedPrice === product.price && salePrice < product.price)) {
        product.discountedPrice = salePrice;
    }

    product.activeSale = {
      name: sale.name,
      discountType: sale.discountType,
      discountValue: sale.discountValue,
    };

    return product;
  }

  async findAll(query: any = {}) {
    const filter: any = {};

    // Normalize keys (handle colors[] vs colors vs sizes[] etc)
    const normalized: any = {};
    for (const key in query) {
      // Clean up brackets and URI encoding artifacts
      let k = key;
      if (k.endsWith('[]')) k = k.slice(0, -2);
      if (k.includes('%5B%5D')) k = k.replace('%5B%5D', '');
      
      // If key already exists (e.g. multiple params with same key), turn into array
      if (normalized[k]) {
        if (!Array.isArray(normalized[k])) normalized[k] = [normalized[k]];
        normalized[k].push(query[key]);
      } else {
        normalized[k] = query[key];
      }
    }

    if (normalized.categoryId) filter.categoryId = new Types.ObjectId(normalized.categoryId);
    if (normalized.type) filter.type = normalized.type;
    if (normalized.purchaseType) filter.purchaseType = normalized.purchaseType;
    
    // On Sale Filter - Must cross-reference with active sales since discountedPrice is calculated at runtime
    if (normalized.onSale === 'true') {
      const now = new Date();
      // Use the model directly via salesService or inject SaleModel if needed
      // To keep it clean and avoid circular dependency complexities, we can use the salesService if it has a way to get active sale targets
      // For now, let's just fetch active sales directly here
      const activeSales = await this.salesService.findAll();
      const liveSales = activeSales.filter(s => s.isActive && new Date(s.startDate) <= now && new Date(s.endDate) >= now);

      const productIds = [];
      const categoryIds = [];
      let allOnSale = false;

      for (const sale of liveSales) {
        if (sale.targetType === 'all') {
          allOnSale = true;
          break;
        } else if (sale.targetType === 'product') {
          productIds.push(...sale.targetIds.map(id => new Types.ObjectId(id)));
        } else if (sale.targetType === 'category') {
          categoryIds.push(...sale.targetIds.map(id => new Types.ObjectId(id)));
        }
      }

      if (!allOnSale) {
        filter.$or = [
          ...(productIds.length > 0 ? [{ _id: { $in: productIds } }] : []),
          ...(categoryIds.length > 0 ? [{ categoryId: { $in: categoryIds } }] : []),
        ];
        
        // If no sales are active, force return nothing
        if (filter.$or.length === 0) {
            filter._id = new Types.ObjectId(); // Guaranteed non-existent
        }
      }
    }

    // Strict Color Filter
    if (normalized.colors) {
      const colorsArr = (Array.isArray(normalized.colors) ? normalized.colors : [normalized.colors])
        .map(c => c.trim())
        .filter(Boolean);
      
      if (colorsArr.length > 0) {
        // Use $in to match ANY of the selected colors exactly (case-insensitive)
        filter.colors = { 
          $in: colorsArr.map(c => new RegExp(`^${c.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')) 
        };
      }
    }

    // Strict Size Filter
    if (normalized.sizes) {
      const sizesArr = (Array.isArray(normalized.sizes) ? normalized.sizes : [normalized.sizes])
        .map(s => s.trim())
        .filter(Boolean);

      if (sizesArr.length > 0) {
        filter.sizes = { 
          $in: sizesArr.map(s => new RegExp(`^${s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')) 
        };
      }
    }

    if (normalized.minPrice || normalized.maxPrice) {
      filter.price = {};
      if (normalized.minPrice) filter.price.$gte = Number(normalized.minPrice);
      if (normalized.maxPrice) filter.price.$lte = Number(normalized.maxPrice);
    }
    if (normalized.search) {
      filter.$or = [
        { name: { $regex: normalized.search, $options: 'i' } },
        { slug: { $regex: normalized.search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, Number(normalized.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(normalized.limit) || 20));
    const skip = (page - 1) * limit;

    let sort: any = { createdAt: -1 };
    if (normalized.sortBy === 'price-low') sort = { price: 1 };
    if (normalized.sortBy === 'price-high') sort = { price: -1 };
    if (normalized.sortBy === 'oldest') sort = { createdAt: 1 };
    if (normalized.sortBy === 'most-popular') sort = { rating: -1 };
    if (normalized.sortBy === 'newest') sort = { createdAt: -1 };

    const [products, total] = await Promise.all([
      this.productModel.find(filter).populate('categoryId', 'name slug').skip(skip).limit(limit).sort(sort).lean(),
      this.productModel.countDocuments(filter),
    ]);

    const productsWithDiscounts = await Promise.all(
      products.map(async (p) => {
        // Deep safety parse
        const fix = (v: any) => {
          if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
          if (Array.isArray(v) && v.length === 1 && typeof v[0] === 'string' && v[0].startsWith('[')) {
            try { return JSON.parse(v[0]); } catch { return v; }
          }
          return v;
        };
        p.colors = fix(p.colors);
        p.sizes = fix(p.sizes);

        const activeSale = await this.salesService.getActiveSaleForProduct(
          p._id.toString(),
          p.categoryId?._id?.toString()
        );
        return this.applyDiscount(p, activeSale);
      })
    );

    return {
      products: productsWithDiscounts,
      totalCount: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).populate('categoryId', 'name slug').lean();
    if (!product) throw new NotFoundException('Product not found');
    
    // Deep safety parse
    const fix = (v: any) => {
      if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
      if (Array.isArray(v) && v.length === 1 && typeof v[0] === 'string' && v[0].startsWith('[')) {
        try { return JSON.parse(v[0]); } catch { return v; }
      }
      return v;
    };
    product.colors = fix(product.colors);
    product.sizes = fix(product.sizes);
    
    const activeSale = await this.salesService.getActiveSaleForProduct(
      product._id.toString(),
      product.categoryId?._id?.toString()
    );
    
    return this.applyDiscount(product, activeSale);
  }

  async findBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug }).populate('categoryId', 'name slug _id').lean();
    if (!product) throw new NotFoundException('Product not found');

    // Deep safety parse
    const fix = (v: any) => {
      if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
      if (Array.isArray(v) && v.length === 1 && typeof v[0] === 'string' && v[0].startsWith('[')) {
        try { return JSON.parse(v[0]); } catch { return v; }
      }
      return v;
    };
    product.colors = fix(product.colors);
    product.sizes = fix(product.sizes);

    const activeSale = await this.salesService.getActiveSaleForProduct(
      product._id.toString(),
      product.categoryId?._id?.toString()
    );
    
    return this.applyDiscount(product, activeSale);
  }

  async create(data: any) {
    const existing = await this.productModel.findOne({ slug: data.slug });
    if (existing) throw new ConflictException('A product with this slug already exists');

    const product = new this.productModel({
      ...data,
      categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : null,
    });
    return product.save();
  }

  async update(id: string, data: any) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (data.slug && data.slug !== product.slug) {
      const existing = await this.productModel.findOne({ slug: data.slug });
      if (existing) throw new ConflictException('A product with this slug already exists');
    }

    if (data.categoryId) data.categoryId = new Types.ObjectId(data.categoryId);

    Object.assign(product, data);
    return product.save();
  }

  async remove(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    await this.productModel.deleteOne({ _id: id });
    return { message: 'Product deleted' };
  }
}
