import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  RawMaterial,
  RawMaterialDocument,
} from '../raw-materials/schemas/raw-material.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Setting, SettingDocument } from '../settings/schemas/setting.schema';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  async run() {
    await Promise.all([
      this.userModel.deleteMany({}),
      this.rawMaterialModel.deleteMany({}),
      this.productModel.deleteMany({}),
    ]);

    const adminHash = await bcrypt.hash('admin123', 10);
    await this.userModel.create({
      name: 'Admin',
      email: 'admin@demo.com',
      passwordHash: adminHash,
      role: UserRole.Admin,
    });

    const [flour, sugar, milk] = await this.rawMaterialModel.create([
      { name: 'Flour', currentStock: 12000, minStockAlert: 3000, unit: 'g' },
      { name: 'Sugar', currentStock: 7000, minStockAlert: 2000, unit: 'g' },
      { name: 'Milk', currentStock: 60, minStockAlert: 15, unit: 'L' },
    ]);

    await this.productModel.create([
      {
        name: 'Pancake',
        price: 6.5,
        recipe: [
          { rawMaterialId: flour._id, quantity: 150 },
          { rawMaterialId: milk._id, quantity: 0.2 },
          { rawMaterialId: sugar._id, quantity: 20 },
        ],
      },
      {
        name: 'Cake Slice',
        price: 5,
        recipe: [
          { rawMaterialId: flour._id, quantity: 100 },
          { rawMaterialId: sugar._id, quantity: 45 },
          { rawMaterialId: milk._id, quantity: 0.1 },
        ],
      },
    ]);

    await this.settingModel.findOneAndUpdate(
      { key: 'default' },
      { key: 'default', taxPercent: 0, currency: 'USD', storeName: 'Demo POS' },
      { upsert: true, new: true },
    );

    return { message: 'Seed complete' };
  }

  async bootstrap() {
    const usersCount = await this.userModel.countDocuments();
    if (usersCount > 0) {
      throw new ForbiddenException(
        'Bootstrap seed is disabled after initial user creation',
      );
    }
    return this.run();
  }
}
