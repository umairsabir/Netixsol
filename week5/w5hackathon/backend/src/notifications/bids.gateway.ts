import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './schemas/notification.schema';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.some(o => origin.startsWith(o!)) || /.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private notificationsService: NotificationsService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinCar')
  handleJoinCar(@MessageBody() carId: string, @ConnectedSocket() client: Socket) {
    client.join(carId);
    console.log(`Client ${client.id} joined car room: ${carId}`);
  }

  @SubscribeMessage('leaveCar')
  handleLeaveCar(@MessageBody() carId: string, @ConnectedSocket() client: Socket) {
    client.leave(carId);
  }

  broadcastNewBid(carId: string, bidData: any) {
    this.server.to(carId).emit('newBid', bidData);
  }

  broadcastAuctionEnded(carId: string, winnerData: any) {
    this.server.to(carId).emit('auctionEnded', winnerData);
  }

  broadcastShippingUpdate(bidId: string, statusData: any) {
    this.server.emit(`shippingUpdate_${bidId}`, statusData);
  }

  // Global Notifications
  async notifyNewAuction(car: any) {
    // Save persistent global notification
    await this.notificationsService.create({
      userId: null,
      title: 'New Auction Live! 📢',
      message: `${car.title} is now open for bidding.`,
      type: NotificationType.INFO,
      link: `/car/${car._id || car.id}`
    });

    this.server.emit('newAuction', {
      title: car.title,
      id: car._id,
      image: car.images?.[0]
    });
  }

  async notifyGlobalBid(bid: any) {
    // Save persistent global notification
    await this.notificationsService.create({
      userId: null,
      title: 'New Bid Alert 💰',
      message: `${bid.user?.firstName || 'Someone'} bid $${bid.amount} on ${bid.car?.title || 'a car'}`,
      type: NotificationType.INFO,
      link: `/car/${bid.car?._id || bid.car}`
    });

    const data = {
      carTitle: bid.car?.title || 'a car',
      userName: `${bid.user?.firstName || 'Someone'}`,
      amount: bid.amount,
      carId: bid.car?._id || bid.car,
      userId: bid.user?._id || bid.user
    };
    this.server.emit('globalBid', data);
  }

  async notifyAuctionWinner(bid: any) {
    const winnerId = bid.user?._id || bid.user;
    const carId = bid.car?._id || bid.car;
    
    // Save persistent notification for winner
    await this.notificationsService.create({
      userId: winnerId,
      title: 'Auction Won! 🎉',
      message: `Congratulations! You won the auction for ${bid.car?.title || 'a car'} with a bid of $${bid.amount}.`,
      type: NotificationType.SUCCESS,
      link: `/car/${bid.car?.slug || carId}`
    });

    this.server.emit('auctionWinner', {
      carTitle: bid.car?.title || 'a car',
      userName: `${bid.user?.firstName || 'Someone'}`,
      amount: bid.amount,
      carId: carId,
      userId: winnerId
    });
  }

  async notifyAuctionClosed(car: any) {
    this.server.emit('auctionClosed', {
      title: car.title,
      id: car._id
    });
  }
}
