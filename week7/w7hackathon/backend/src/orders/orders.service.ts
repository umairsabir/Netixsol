import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersFilterDto } from './dto/get-orders-filter.dto';
import { ProductsService } from '../products/products.service';
import { RawMaterialsService } from '../raw-materials/raw-materials.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly productsService: ProductsService,
    private readonly rawMaterialsService: RawMaterialsService,
  ) {}

  async findAll(filter: GetOrdersFilterDto) {
    const { page = 1, limit = 50, startDate, endDate, search } = filter;
    const query: any = {};

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

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const [nodes, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.orderModel.countDocuments(query),
    ]);

    return { nodes, total, page, limit };
  }

  async create(dto: CreateOrderDto, userId: string) {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const materialUsage = new Map<string, number>();
        const orderItems: {
          productId: Types.ObjectId;
          productName: string;
          quantity: number;
          unitPrice: number;
          lineTotal: number;
        }[] = [];
        let subtotal = 0;

        for (const item of dto.items) {
          const product = await this.productsService.findOne(item.productId);
          if (!product.isActive) {
            throw new BadRequestException(
              `Product ${product.name} is inactive`,
            );
          }
          if (item.quantity > product.availableStock) {
            throw new BadRequestException(
              `Insufficient stock for product ${product.name}`,
            );
          }

          for (const recipeItem of product.recipe) {
            const key = recipeItem.rawMaterialId.toString();
            const usedQty = materialUsage.get(key) ?? 0;
            materialUsage.set(
              key,
              usedQty + recipeItem.quantity * item.quantity,
            );
          }

          const lineTotal = product.price * item.quantity;
          subtotal += lineTotal;
          orderItems.push({
            productId: new Types.ObjectId(item.productId),
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal,
          });
        }

        const order = await this.orderModel.create(
          [
            {
              orderNumber,
              items: orderItems,
              subtotal,
              tax: 0,
              total: subtotal,
              createdBy: new Types.ObjectId(userId),
              status: 'completed',
              materialUsage: [...materialUsage.entries()].map(
                ([rawMaterialId, quantity]) => ({
                  rawMaterialId: new Types.ObjectId(rawMaterialId),
                  quantity,
                }),
              ),
            },
          ],
          { session },
        );

        for (const [rawMaterialId, qty] of materialUsage.entries()) {
          const material =
            await this.rawMaterialsService.findOne(rawMaterialId);
          await this.rawMaterialsService.applyStockDelta(
            material,
            -qty,
            'order_deduct',
            userId,
            order[0]._id.toString(),
            undefined,
            session,
          );
        }
        return order[0];
      });
    } finally {
      await session.endSession();
    }
  }

  async voidOrder(id: string, userId: string, reason?: string) {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const order = await this.orderModel.findById(id);
        if (!order) throw new NotFoundException('Order not found');
        if (order.status === 'voided')
          throw new BadRequestException('Order already voided');

        for (const usage of order.materialUsage) {
          const material = await this.rawMaterialsService.findOne(
            usage.rawMaterialId.toString(),
          );
          await this.rawMaterialsService.applyStockDelta(
            material,
            usage.quantity,
            'order_void_restore',
            userId,
            order._id.toString(),
            reason,
            session,
          );
        }

        order.status = 'voided';
        order.voidedBy = userId;
        order.voidReason = reason;
        await order.save({ session });
        return order;
      });
    } finally {
      await session.endSession();
    }
  }

  async exportCsv() {
    const orders = await this.orderModel.find().sort({ createdAt: -1 });
    const header = 'orderId,status,subtotal,tax,total,createdAt';
    const rows = orders.map((order) =>
      [
        order._id.toString(),
        order.status,
        order.subtotal,
        order.tax,
        order.total,
        (order as unknown as { createdAt?: Date }).createdAt?.toISOString() ??
          '',
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }
}
