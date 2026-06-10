import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  RawMaterial,
  RawMaterialSchema,
} from '../raw-materials/schemas/raw-material.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Setting, SettingSchema } from '../settings/schemas/setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Setting.name, schema: SettingSchema },
    ]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
