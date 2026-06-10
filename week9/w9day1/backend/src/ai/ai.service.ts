import { Injectable, Logger } from '@nestjs/common';
import { LangGraphWorkflow } from './langgraph.workflow';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly workflow: LangGraphWorkflow) {}

  async runResearch(query: string): Promise<{ trace: any; answer: string }> {
    this.logger.log(`[AIService] Starting research for: ${query}`);
    return this.workflow.runResearch(query);
  }
}
