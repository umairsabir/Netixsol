import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll() {
    return this.saleModel.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string) {
    const sale = await this.saleModel.findById(id).lean();
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async create(data: any) {
    const sale = new this.saleModel({
      ...data,
      targetIds: data.targetIds?.map((id: string) => new Types.ObjectId(id)) || [],
    });
    const savedSale = await sale.save();
    
    // Emit notification if sale is active and started
    if (savedSale.isActive) {
      if (new Date() >= savedSale.startDate && new Date() <= savedSale.endDate) {
         this.notificationsGateway.emitSaleStarted(savedSale);
      }
    }
    
    return savedSale;
  }

  async update(id: string, data: any) {
    const sale = await this.saleModel.findById(id);
    if (!sale) throw new NotFoundException('Sale not found');

    Object.assign(sale, {
      ...data,
      targetIds: data.targetIds?.map((id: string) => new Types.ObjectId(id)) || sale.targetIds,
    });
    
    const wasActive = sale.isActive;
    const savedSale = await sale.save();
    
    // Notify users if the sale is currently live
    if (savedSale.isActive) {
       const now = new Date();
       if (now >= savedSale.startDate && now <= savedSale.endDate) {
         this.notificationsGateway.emitSaleStarted(savedSale);
       }
    }

    return savedSale;
  }

  async remove(id: string) {
    const sale = await this.saleModel.findById(id);
    if (!sale) throw new NotFoundException('Sale not found');
    await this.saleModel.deleteOne({ _id: id });
    return { message: 'Sale deleted' };
  }

  async getActiveSaleForProduct(productId: string, categoryId?: string) {
    const now = new Date();
    // Find active sales where now is between start and end date
    const activeSales = await this.saleModel.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    let bestDiscount = 0;
    let selectedSale: Sale | null = null;

    for (const sale of activeSales) {
      let applies = false;

      if (sale.targetType === 'all') {
        applies = true;
      } else if (sale.targetType === 'product' && sale.targetIds.some(id => id.toString() === productId)) {
        applies = true;
      } else if (sale.targetType === 'category' && categoryId && sale.targetIds.some(id => id.toString() === categoryId)) {
        applies = true;
      }

      if (applies) {
        // We'll simplify for now: just return the highest percentage or fixed discount
        // You might want more complex logic (e.g. stackability) in the future.
        return sale; // Return the first matching one for now, or find the "best" one
      }
    }

    return null;
  }
}
