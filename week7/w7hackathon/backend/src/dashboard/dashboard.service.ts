import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { RawMaterialsService } from '../raw-materials/raw-materials.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly rawMaterialsService: RawMaterialsService,
    private readonly productsService: ProductsService,
  ) {}

  async summary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      ordersToday,
      allRawMaterials,
      totalProducts,
      chartDataRaw,
      topProductsRaw,
    ] = await Promise.all([
      // Orders Today
      this.orderModel.find({
        status: 'completed',
        createdAt: { $gte: todayStart },
      }),
      // Raw Materials for status
      this.rawMaterialsService.findAll(),
      // Total Products count
      this.productsService.findAll().then((p) => p.length),
      // Chart Data (last 7 days revenue)
      this.orderModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Top Products (by units sold)
      this.orderModel.aggregate([
        { $match: { status: 'completed' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.productName' },
            units: { $sum: '$items.quantity' },
          },
        },
        { $sort: { units: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalSalesToday = ordersToday.reduce(
      (sum, order) => sum + order.total,
      0,
    );

    const lowStockAlertCount = allRawMaterials.filter(
      (item) => item.currentStock <= item.minStockAlert,
    ).length;

    return {
      totalSalesToday,
      ordersToday: ordersToday.length,
      totalProducts,
      lowStockAlertCount,
      chartData: chartDataRaw.map((item) => ({
        date: item._id,
        revenue: item.revenue,
        orders: item.orders,
      })),
      topProducts: topProductsRaw.map((item) => ({
        name: item.name || 'Unknown Product',
        units: item.units,
      })),
      inventoryStatus: lowStockAlertCount > 0 ? 'attention' : 'healthy',
    };
  }
}
