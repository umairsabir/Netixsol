import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        // Allow unauthenticated connection but don't join personal room
        return;
      }

      const payload = this.jwtService.verify(token, { secret: 'super-secret-key-123' });
      if (payload && payload.sub) {
        client.data.userId = payload.sub;
        client.data.username = payload.username;
        await client.join(payload.sub);
        console.log(`Socket Connected: User ${payload.username} joined room ${payload.sub}`);
      }
    } catch (err) {
      console.log('Socket Connection Auth failed:', err.message);
      // Let it connect but unauthenticated
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket Disconnected: ${client.id}`);
  }

  // Broadcaster methods to trigger real-time actions
  broadcastComment(comment: any) {
    this.server.emit('comment.created', comment);
  }

  sendPersonalNotification(userId: string, notification: any) {
    this.server.to(userId).emit('notification.received', notification);
  }
}
