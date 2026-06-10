import { tool } from '@openai/agents';
import { z } from 'zod';

// Calculator Tool
export const calculatorTool = tool({
  name: 'calculator',
  description: 'Evaluate basic math expressions (add, subtract, multiply, divide).',
  parameters: z.object({
    expression: z.string().describe('The math expression to evaluate, e.g. "2 + 2"'),
  }),
  execute: async ({ expression }: { expression: string }) => {
    console.log(`\n[Tool: calculator] Evaluating: ${expression}`);
    try {
      // NOTE: Using eval for demo purposes. In production use a safe math parser.
      const result = eval(expression);
      const output = `Result of ${expression} is ${result}`;
      console.log(`[Tool: calculator] Output: ${output}`);
      return output;
    } catch (e) {
      return `Error evaluating expression: ${e}`;
    }
  },
});

// Word Counter Tool
export const wordCounterTool = tool({
  name: 'wordCounter',
  description: 'Count the number of words in a given text.',
  parameters: z.object({
    text: z.string().describe('The text to count words for'),
  }),
  execute: async ({ text }: { text: string }) => {
    console.log(`\n[Tool: wordCounter] Counting words in: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const count = words.length;
    console.log(`[Tool: wordCounter] Count: ${count}`);
    return `The text has ${count} words.`;
  },
});
