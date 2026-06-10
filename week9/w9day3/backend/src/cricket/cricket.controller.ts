import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CricketWorkflow } from '../ai/cricket.workflow';
import { CricketService } from './cricket.service';

@Controller('cricket')
export class CricketController {
  private readonly logger = new Logger(CricketController.name);

  constructor(
    private readonly cricketWorkflow: CricketWorkflow,
    private readonly cricketService: CricketService,
  ) {}

  // POST /cricket/ask — Main endpoint
  @Post('ask')
  async ask(
    @Body('question') question: string,
    @Body('userId') userId: string,
  ) {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('Question is required');
    }

    const uid = (userId || 'anonymous').trim();
    this.logger.log(`[Ask] Received: "${question}" from userId: ${uid}`);

    const result = await this.cricketWorkflow.askQuestion(question, uid);

    return {
      queryId: result.trace.queryId,
      answer: result.answer,
      isRelevant: result.trace.isRelevant,
      trace: result.trace,
    };
  }

  // GET /cricket/history/:userId — Conversation history
  @Get('history/:userId')
  async history(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.cricketService.getHistory(userId);
  }

  // GET /cricket/summary/:userId — Memory summary
  @Get('summary/:userId')
  async summary(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    const summary = await this.cricketService.getSummary(userId);
    if (!summary) {
      return { userId, summary: null, message: 'No summary yet. Ask more questions!' };
    }
    return summary;
  }

  // POST /cricket/seed
  @Post('seed')
  async seed() {
    this.logger.log('[Seed] Seeding cricket data');
    return this.cricketService.seedData();
  }

  // GET /cricket/stats
  @Get('stats')
  async stats() {
    return this.cricketService.getStats();
  }

  // GET /cricket/traces
  @Get('traces')
  async traces() {
    return this.cricketService.findAllTraces();
  }

  // GET /cricket/trace/:id
  @Get('trace/:id')
  async getTrace(@Param('id') id: string) {
    const trace = await this.cricketService.findTraceByQueryId(id);
    if (!trace) {
      throw new NotFoundException(`Trace with ID ${id} not found`);
    }
    return trace;
  }
}
