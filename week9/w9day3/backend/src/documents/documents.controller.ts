import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { AIService } from '../ai/ai.service';

@Controller()
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly aiService: AIService,
  ) {}

  // POST /ask - Run the research workflow
  @Post('ask')
  async ask(@Body('question') question: string) {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('Question is required');
    }

    this.logger.log(`[Ask] Received question: ${question}`);

    try {
      const result = await this.aiService.runResearch(question);
      return {
        queryId: result.trace.queryId,
        answer: result.answer,
        trace: result.trace,
      };
    } catch (error) {
      this.logger.error(`[Ask] Error: ${error.message}`);
      throw new BadRequestException(`Research failed: ${error.message}`);
    }
  }

  // POST /upload - Upload research documents (JSON format)
  @Post('upload')
  async uploadDocument(
    @Body()
    documentData: {
      title: string;
      topic: string;
      content: string;
      keywords?: string[];
    },
  ) {
    if (!documentData.title || !documentData.topic || !documentData.content) {
      throw new BadRequestException('title, topic, and content are required');
    }

    try {
      const doc =
        await this.documentsService.createResearchDocument(documentData);
      return {
        id: (doc as any)._id,
        title: doc.title,
        topic: doc.topic,
        wordCount: doc.wordCount,
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`[Upload] Error: ${error.message}`);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  // GET /trace/:id - Fetch trace of a past query
  @Get('trace/:id')
  async getTrace(@Param('id') id: string) {
    const trace = await this.documentsService.findTraceByQueryId(id);
    if (!trace) {
      throw new NotFoundException(`Trace with ID ${id} not found`);
    }
    return trace;
  }

  // GET /documents - List all research documents
  @Get('documents')
  async listDocuments() {
    return this.documentsService.findAllResearchDocuments();
  }

  // GET /traces - List all query traces
  @Get('traces')
  async listTraces() {
    return this.documentsService.findAllTraces();
  }
}
