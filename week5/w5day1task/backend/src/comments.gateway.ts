import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
  transports: ['polling', 'websocket'],
})
export class CommentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private comments: any[] = [];
  private liveUsers: number = 0;

  handleConnection(client: Socket) {
    this.liveUsers++;
    this.server.emit('live_users_count', this.liveUsers);
  }

  handleDisconnect(client: Socket) {
    this.liveUsers--;
    this.server.emit('live_users_count', this.liveUsers);
  }

  @SubscribeMessage('add_comment')
  handleAddComment(
    @MessageBody() payload: { author: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const newComment = {
      id: Date.now().toString(),
      author: payload.author || 'Anonymous',
      text: payload.text,
      senderId: client.id,
      createdAt: new Date(),
    };
    
    this.comments.push(newComment);
    
    // Emit to all connected clients
    this.server.emit('new_comment', newComment);
  }

  @SubscribeMessage('get_comments')
  handleGetComments() {
    return { event: 'all_comments', data: this.comments };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() payload: { author: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('user_typing', { 
      author: payload.author || 'Anonymous', 
      senderId: client.id 
    });
  }
}
