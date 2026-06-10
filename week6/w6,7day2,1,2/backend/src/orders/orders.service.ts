import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InjectConnection } from '@nestjs/mongoose';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.usersService.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      let totalAmount = 0;
      let totalPointsToAward = 0;
      let totalPointsToDeduct = 0;
      const orderItems: any[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productsService.findById(item.productId);
        const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice !== null;
        let price = Number(hasDiscount ? product.discountedPrice : product.price);
        let pointsReward = Number(product.pointsReward || 0);
        let pointsPrice = Number(product.pointsPrice || 0);

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }
        product.stock -= item.quantity;

        // Handle points redemption
        if (item.usePoints) {
          if (product.purchaseType === 'money') {
            throw new BadRequestException(`${product.name} cannot be bought with points`);
          }
          if (user.points < pointsPrice * item.quantity) {
             throw new BadRequestException(`Insufficient loyalty points to buy ${product.name}`);
          }
          totalPointsToDeduct += pointsPrice * item.quantity;
          // Price is 0 if paid by points
          price = 0; 
        }

        totalAmount += price * item.quantity;
        totalPointsToAward += pointsReward * item.quantity;

        orderItems.push({
          productId: product._id,
          color: (item as any).color,
          size: (item as any).size,
          quantity: item.quantity,
          priceAtPurchase: price,
          pointsAtPurchase: item.usePoints ? pointsPrice : 0,
        });

        // Save product stock change
        await this.productsService.update(product._id.toString(), { 
            stock: product.stock,
        });
      }

      // Final point check for user
      if (totalPointsToDeduct > user.points) {
        throw new BadRequestException('Insufficient loyalty points');
      }

      const order = new this.orderModel({
        userId: new Types.ObjectId(userId),
        items: orderItems,
        totalAmount,
        totalPoints: totalPointsToDeduct,
        totalPointsAwarded: totalPointsToAward,
        paymentMethod: createOrderDto.paymentMethod,
        shippingAddress: createOrderDto.shippingAddress,
        status: 'pending',
        // For Stripe, stay pending until webhook confirms. For COD/points, mark based on method.
        paymentStatus: createOrderDto.paymentMethod === 'stripe' ? 'pending' : 
                       createOrderDto.paymentMethod === 'cod' ? 'pending' : 'paid',
        ...(createOrderDto.stripeSessionId ? { stripeSessionId: createOrderDto.stripeSessionId } : {}),
      });

      const savedOrder = await order.save({ session });

      // Update user points: ONLY deduct spent points at creation. 
      // Do NOT award points yet (user wants points only on delivery).
      if (totalPointsToDeduct > 0 && createOrderDto.paymentMethod !== 'stripe') {
        await this.usersService.updatePoints(userId, -totalPointsToDeduct, session);
      }
      
      if (createOrderDto.paymentMethod !== 'stripe') {
        // Save notification for user
        await this.notificationsService.create({
          userId: userId,
          title: 'Order Placed!',
          message: `Your order #${savedOrder._id.toString().slice(-8).toUpperCase()} has been placed successfully.`,
          type: 'order_placed',
          link: `/orders/${savedOrder._id}`
        });

        // Save notifications for admins
        const admins = await this.usersService.findAdmins();
        for (const admin of admins) {
           await this.notificationsService.create({
             userId: admin._id.toString(),
             title: 'New Order Received',
             message: `A new order #${savedOrder._id.toString().slice(-8).toUpperCase()} has been placed by ${user.name}.`,
             type: 'order_placed',
             link: `/admin/orders/${savedOrder._id}`
           });
        }
      }

      await session.commitTransaction();
      return savedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async confirmStripePayment(stripeSessionId: string, paymentIntentId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const order = await this.orderModel
        .findOne({ stripeSessionId })
        .session(session);

      if (!order || order.paymentStatus === 'paid') {
        await session.commitTransaction();
        return; // Idempotent — don't process twice
      }

      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.stripePaymentIntentId = paymentIntentId;
      await order.save({ session });

      // Deduct points if applicable (points were NOT deducted at order creation for stripe orders)
      if (order.totalPoints > 0) {
        await this.usersService.updatePoints(
          order.userId.toString(),
          -order.totalPoints,
          session,
        );
      }

      // Notify user
      await this.notificationsService.create({
        userId: order.userId.toString(),
        title: 'Payment Confirmed!',
        message: `Payment for order #${order._id.toString().slice(-8).toUpperCase()} was successful.`,
        type: 'order_placed',
        link: `/orders/${order._id}`,
      });

      const admins = await this.usersService.findAdmins();
      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin._id.toString(),
          title: 'Stripe Payment Received',
          message: `Order #${order._id.toString().slice(-8).toUpperCase()} payment confirmed via Stripe.`,
          type: 'order_placed',
          link: `/admin/orders/${order._id}`,
        });
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async failStripePayment(stripeSessionId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const order = await this.orderModel.findOne({ stripeSessionId }).session(session);
      if (!order || order.status === 'cancelled') {
        await session.commitTransaction();
        return; // Idempotent or not found
      }

      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      await order.save({ session });

      // Restore stock
      for (const item of order.items) {
        const product = await this.productsService.findById(item.productId.toString());
        if (product) {
          await this.productsService.update(product._id.toString(), {
            stock: product.stock + item.quantity,
          });
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(query: any = {}) {
    const filter: any = {};
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (query.status) filter.status = query.status;

    return this.orderModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name images')
      .lean();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const order = await this.orderModel.findById(id).session(session);
      if (!order) throw new NotFoundException('Order not found');

      const oldStatus = order.status;
      const newStatus = updateDto.status;

      // Update order fields
      if (updateDto.status) order.status = updateDto.status;
      if (updateDto.paymentStatus) order.paymentStatus = updateDto.paymentStatus;
      
      const savedOrder = await order.save({ session });

      // Handle Logic Transitions
      if (oldStatus !== newStatus) {
        // 1. Award points on delivery (from any non-delivered state to delivered)
        if (newStatus === 'delivered' && oldStatus !== 'cancelled') {
           if (savedOrder.totalPointsAwarded > 0) {
             await this.usersService.updatePoints(savedOrder.userId.toString(), savedOrder.totalPointsAwarded, session);
           }
        }

        // 2. Handle Cancellation: Restore Stock and Refund Points
        if (newStatus === 'cancelled' && oldStatus !== 'cancelled' && oldStatus !== 'delivered') {
           // Restore Stock
           for (const item of savedOrder.items) {
             const product = await this.productsService.findById(item.productId.toString());
             if (product) {
                await this.productsService.update(product._id.toString(), {
                  stock: product.stock + item.quantity
                });
             }
           }

           // Refund Points Spent
           if (savedOrder.totalPoints > 0) {
             await this.usersService.updatePoints(savedOrder.userId.toString(), savedOrder.totalPoints, session);
           }
        }

        // 3. Notify user (Database + Real-time via Service)
        await this.notificationsService.create({
          userId: savedOrder.userId.toString(),
          title: 'Order Status Updated',
          message: `Your order #${savedOrder._id.toString().slice(-8).toUpperCase()} is now ${newStatus}.`,
          type: 'status_updated',
          link: `/orders/${savedOrder._id}`
        });
      }

      await session.commitTransaction();
      return savedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async remove(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    await this.orderModel.deleteOne({ _id: id });
    return { message: 'Order deleted' };
  }

  async getStats() {
    const totalOrders = await this.orderModel.countDocuments();
    const pendingOrders = await this.orderModel.countDocuments({ status: 'pending' });
    const completedOrders = await this.orderModel.countDocuments({ status: 'delivered' });
    const processingOrders = await this.orderModel.countDocuments({ status: 'processing' });
    
    // Revenue aggregation
    const revenueResult = await this.orderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly stats for graph (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $count: {} }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const bestSellers = await this.getTopProducts(3);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      processingOrders,
      totalRevenue,
      bestSellers,
      monthlyStats: monthlyStats.map(s => ({
        month: new Date(0, s._id.month - 1).toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        value: s.total
      }))
    };
  }
  
  async getTopProducts(limit = 5) {
     return this.orderModel.aggregate([
       { $match: { paymentStatus: 'paid' } },
       { $unwind: '$items' },
       {
         $group: {
           _id: '$items.productId',
           name: { $first: '$items.name' },
           totalSales: { $sum: '$items.quantity' },
           totalRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
           price: { $first: '$items.priceAtPurchase' }
         }
       },
       { $sort: { totalSales: -1 } },
       { $limit: limit }
     ]);
  }
}
