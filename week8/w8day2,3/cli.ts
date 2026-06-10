import 'dotenv/config'; // load env vars first
import { setTracingDisabled } from '@openai/agents-core';
import { Runner } from '@openai/agents';
import { routerAgent } from './agents';
import * as readline from 'readline';
import { GeminiProvider } from './geminiProvider';

// Disable SDK tracing — it would otherwise try to POST to api.openai.com with our Gemini key
setTracingDisabled(true);

// Create a Runner instance configured with our custom native Gemini provider
const runner = new Runner({
  modelProvider: new GeminiProvider()
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("==========================================");
console.log("🤖 Multi-Agent CLI Assistant Initialized");
console.log("==========================================\n");
console.log("Tracing & Observability Note:");
console.log("The @openai/agents SDK implicitly traces workflows (LLM calls, tool executions, and handoffs).");
console.log("These traces are observable in the OpenAI Platform dashboard, helping debug agent routing and tool inputs.\n");
console.log("Type 'exit' or 'quit' to stop the application.\n");

function askQuestion() {
  rl.question('You: ', async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    try {
      // Execute the agent flow starting with the routerAgent
      const result = await runner.run(routerAgent, input);
      console.log(`\nAssistant: ${result.finalOutput}\n`);
    } catch (error) {
      console.error("\n[Error] Failed to process request:", error);
    }

    // Continue the loop
    askQuestion();
  });
}

askQuestion();
