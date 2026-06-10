import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://umair:11223344@cluster0.y6bxovc.mongodb.net/realtime_comments?retryWrites=true&w=majority'),
    AuthModule,
    UserModule,
    CommentModule,
    NotificationModule,
    GatewayModule,
  ],
})
export class AppModule {}
