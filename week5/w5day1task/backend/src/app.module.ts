import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentsGateway } from './comments.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CommentsGateway],
})
export class AppModule {}
