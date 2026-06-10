import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import {
  RawMaterial,
  RawMaterialDocument,
} from './schemas/raw-material.schema';
import {
  StockHistory,
  StockHistoryDocument,
} from './schemas/stock-history.schema';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { BulkRestockDto, RestockDto } from './dto/restock.dto';
import { GetStockHistoryFilterDto } from './dto/get-stock-history-filter.dto';

@Injectable()
export class RawMaterialsService {
  constructor(
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    @InjectModel(StockHistory.name)
    private readonly stockHistoryModel: Model<StockHistoryDocument>,
  ) {}

  create(dto: CreateRawMaterialDto) {
    return this.rawMaterialModel.create(dto);
  }

  findAll() {
    return this.rawMaterialModel.find().sort({ name: 1 });
  }

  async findOne(id: string) {
    const item = await this.rawMaterialModel.findById(id);
    if (!item) throw new NotFoundException('Raw material not found');
    return item;
  }

  async update(id: string, dto: UpdateRawMaterialDto) {
    const updated = await this.rawMaterialModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new NotFoundException('Raw material not found');
    return updated;
  }

  async remove(id: string, usedMaterialIds: string[]) {
    if (usedMaterialIds.includes(id)) {
      throw new BadRequestException(
        'Cannot delete raw material referenced by product recipes',
      );
    }
    const deleted = await this.rawMaterialModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Raw material not found');
    return { message: 'Raw material deleted' };
  }

  async restock(id: string, dto: RestockDto, actorId?: string) {
    const item = await this.findOne(id);
    return this.applyStockDelta(
      item,
      dto.amount,
      'restock',
      actorId,
      undefined,
      dto.note,
    );
  }

  async bulkRestock(dto: BulkRestockDto, actorId?: string) {
    const results: RawMaterialDocument[] = [];
    const items = (dto.items ?? []) as Array<{
      rawMaterialId?: string;
      amount?: number;
      id?: string;
      quantity?: number;
      note?: string;
    }>;
    for (const item of items) {
      const rawMaterialId = item.rawMaterialId ?? item.id;
      const amount = item.amount ?? item.quantity ?? 0;
      if (!rawMaterialId) {
        continue;
      }
      const material = await this.findOne(rawMaterialId);
      const updated = await this.applyStockDelta(
        material,
        amount,
        'restock',
        actorId,
        undefined,
        item.note,
      );
      results.push(updated);
    }
    return results;
  }

  async applyStockDelta(
    material: RawMaterialDocument,
    delta: number,
    reason: 'order_deduct' | 'order_void_restore' | 'restock',
    actorId?: string,
    orderId?: string,
    note?: string,
    session?: ClientSession,
  ) {
    const before = material.currentStock;
    const after = before + delta;
    if (after < 0) {
      throw new BadRequestException(`Insufficient stock for ${material.name}`);
    }
    material.currentStock = after;
    await material.save({ session });

    await this.stockHistoryModel.create(
      [
        {
          rawMaterialId: material._id,
          delta,
          beforeStock: before,
          afterStock: after,
          reason,
          actorId,
          orderId,
          note,
        },
      ],
      { session },
    );
    return material;
  }

  getUsedMaterialIdsForRecipes(
    recipes: { rawMaterialId: string }[][],
  ): string[] {
    return [...new Set(recipes.flat().map((item) => item.rawMaterialId))];
  }

  async getHistory(filter: GetStockHistoryFilterDto) {
    const query: any = {};
    const { rawMaterialId, startDate, endDate, page = 1, limit = 50 } = filter;

    if (rawMaterialId) {
      query.rawMaterialId = new Types.ObjectId(rawMaterialId);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [nodes, total] = await Promise.all([
      this.stockHistoryModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.stockHistoryModel.countDocuments(query),
    ]);

    return { nodes, total, page, limit };
  }
}
