import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import {
  ResearchDocument,
  ResearchDocumentSchema,
} from './schemas/research-document.schema';
import { QueryTrace, QueryTraceSchema } from './schemas/query-trace.schema';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResearchDocument.name, schema: ResearchDocumentSchema },
      { name: QueryTrace.name, schema: QueryTraceSchema },
    ]),
    AIModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
