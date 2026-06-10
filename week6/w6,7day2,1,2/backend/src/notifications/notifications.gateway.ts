import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    client.join(`user_${userId}`);
    return { status: 'success', joined: `user_${userId}` };
  }

  emitSaleStarted(sale: any) {
    if (this.server) {
      this.server.emit('sale_started', sale);
    }
  }

  sendNotification(userId: string, notification: any) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit('notification', notification);
    }
  }
}
