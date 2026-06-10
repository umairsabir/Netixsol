import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow connections from any origin (e.g. frontend dev server)
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users
  private activeUsers = new Map<string, string[]>(); // userId -> socketIds[]

  handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    if (token) {
      try {
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production'
        );
        const userId = decoded.id || decoded._id;
        
        if (userId) {
          client.join(userId);
          
          const currentSockets = this.activeUsers.get(userId) || [];
          this.activeUsers.set(userId, [...currentSockets, client.id]);
          console.log(`User connected: ${userId} (Socket: ${client.id})`);
        }
      } catch (err) {
        console.log('WS connection auth failed:', err.message);
      }
    } else {
      console.log(`Guest connected (Socket: ${client.id})`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket disconnected: ${client.id}`);
    for (const [userId, socketIds] of this.activeUsers.entries()) {
      const filtered = socketIds.filter((id) => id !== client.id);
      if (filtered.length === 0) {
        this.activeUsers.delete(userId);
      } else {
        this.activeUsers.set(userId, filtered);
      }
    }
  }

  // Broadcast to all connected clients
  broadcastNewReview(reviewData: any) {
    this.server.emit('new-review', reviewData);
  }

  // Send direct notification to a specific user's room
  sendDirectNotification(recipientUserId: string, notification: any) {
    this.server.to(recipientUserId).emit('new-notification', notification);
  }

  // Send product update notification to multiple user IDs
  sendProductUpdate(userIds: string[], updateData: any) {
    userIds.forEach((userId) => {
      this.server.to(userId).emit('product-update', updateData);
    });
  }
}
