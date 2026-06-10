import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { CricketWorkflow } from './ai/cricket.workflow';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cricketWorkflow: CricketWorkflow,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // POST /ask — root level endpoint as per requirements
  @Post('ask')
  async ask(@Body('question') question: string) {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('Question is required');
    }
    const result = await this.cricketWorkflow.askQuestion(question);
    return { answer: result.answer };
  }
}
