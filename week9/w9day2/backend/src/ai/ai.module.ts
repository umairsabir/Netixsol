import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AIService } from './ai.service';
import { LangGraphWorkflow } from './langgraph.workflow';
import {
  ResearchDocument,
  ResearchDocumentSchema,
} from '../documents/schemas/research-document.schema';
import {
  QueryTrace,
  QueryTraceSchema,
} from '../documents/schemas/query-trace.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ResearchDocument.name, schema: ResearchDocumentSchema },
      { name: QueryTrace.name, schema: QueryTraceSchema },
    ]),
  ],
  providers: [AIService, LangGraphWorkflow],
  exports: [AIService],
})
export class AIModule {}
