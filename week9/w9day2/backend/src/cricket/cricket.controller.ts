import {
  Controller,
  Post,
  Get,
  Body,
  Logger,
  BadRequestException,
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

  // POST /cricket/ask
  @Post('ask')
  async ask(
    @Body('question') question: string,
    @Body('userId') userId: string,
  ) {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('Question is required');
    }
    this.logger.log(`[Ask] Received: "${question}"`);
    const result = await this.cricketWorkflow.askQuestion(question);
    return { answer: result.answer };
  }

  // POST /cricket/seed
  @Post('seed')
  async seed() {
    this.logger.log('[Seed] Seeding cricket data');
    return this.cricketService.seedData();
  }

  // POST /cricket/upload — re-upload CSV data
  @Post('upload')
  async upload() {
    this.logger.log('[Upload] Re-uploading cricket data from CSV');
    return this.cricketService.seedData();
  }
}
