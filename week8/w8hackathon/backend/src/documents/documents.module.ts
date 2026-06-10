import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentItem, DocumentSchema } from './schemas/document.schema';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentItem.name, schema: DocumentSchema },
    ]),
    AIModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
