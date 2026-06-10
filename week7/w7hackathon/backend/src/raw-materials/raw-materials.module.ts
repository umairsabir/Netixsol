import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterialsController } from './raw-materials.controller';
import { RawMaterial, RawMaterialSchema } from './schemas/raw-material.schema';
import {
  StockHistory,
  StockHistorySchema,
} from './schemas/stock-history.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RawMaterial.name, schema: RawMaterialSchema },
      { name: StockHistory.name, schema: StockHistorySchema },
    ]),
    forwardRef(() => ProductsModule),
  ],
  providers: [RawMaterialsService],
  controllers: [RawMaterialsController],
  exports: [RawMaterialsService, MongooseModule],
})
export class RawMaterialsModule {}
