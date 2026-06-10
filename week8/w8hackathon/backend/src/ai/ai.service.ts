import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Runner, RunResult } from '@openai/agents';
import { setTracingDisabled } from '@openai/agents-core';
import { createAgents } from './agents';

setTracingDisabled(true);

// Programmatic Guardrails - outside prompts as required
const BLOCKED_PATTERNS = [
  /ignore (previous|all) instructions/i,
  /you are now a/i,
  /forget (your|all) (instructions|rules)/i,
  /act as (a|an) (human|person|different ai)/i,
  /(bomb|weapon|drug|hack|exploit|malware|virus)/i,
  /what('?s| is) (your name|the weather|the time|the date)/i,
  /who (won|is winning)/i,
];

function runGuardrails(message: string): void {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(message)) {
      throw new BadRequestException(
        'GUARDRAIL_BLOCKED: This query is not related to document analysis.',
      );
    }
  }
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  async chat(
    message: string,
    documentId?: string,
    fullText?: string,
  ): Promise<any> {
    const startTime = Date.now();

    // STEP 1: Run Programmatic Guardrails
    runGuardrails(message);

    // Build context with document information
    let input = message;
    if (documentId) input = `[Document ID: ${documentId}]\n${input}`;
    if (fullText)
      input = `[Document Content]\n${fullText.substring(0, 3000)}\n\n[User Question]\n${input}`;

    this.logger.log(`\n\n=== [NEW AGENTIC RUN] ===`);
    this.logger.log(`Input: ${message.substring(0, 100)}...`);

    try {
      const { routerAgent } = createAgents();
      const runner = new Runner();

      this.logger.log(`[System] Execution started.`);

      const result = await runner.run(routerAgent as any, input, {
        maxTurns: 10,
      });

      // Log execution trace from result
      const messages = (result as any).newItems || (result as any).messages || [];
      messages.forEach((item: any) => {
        if (item.type === 'agent_updated_stream_event' || item.agent) {
          this.logger.log(`[Agent] ${item.agent?.name || JSON.stringify(item.type)}`);
        }
        if (item.type === 'handoff_called' || item.type === 'handoff_output') {
          this.logger.log(`[Handoff] → ${item.targetAgent || item.agent?.name}`);
        }
        if (item.type === 'tool_call_item' || item.rawItem?.type === 'function_call') {
          this.logger.log(`[Tool] ${item.rawItem?.name || 'tool called'}`);
        }
      });

      this.logger.log(`[Last Agent] ${(result as any).lastAgent?.name || 'Unknown'}`);


      const duration = Date.now() - startTime;
      this.logger.log(`[System] Run completed in ${duration}ms.`);
      this.logger.log(`[Result] Final output length: ${result.finalOutput?.length || 0} chars`);
      this.logger.log(`=== [RUN END] ===\n`);

      return {
        finalOutput: result.finalOutput,
        messages: (result as any).messages || [],
        agent: (result as any).agent || null,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[System] Run failed after ${duration}ms: ${error.message}`,
      );
      throw error;
    }
  }
}
