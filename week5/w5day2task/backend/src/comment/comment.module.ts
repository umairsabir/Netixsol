import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { GatewayModule } from '../gateway/gateway.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema }
    ]),
    UserModule,
    NotificationModule,
    GatewayModule,
    AuthModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
