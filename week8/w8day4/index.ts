import 'dotenv/config'; // load env vars first

// Map Groq config to OpenAI defaults BEFORE importing @openai/agents
if (process.env.GROQ_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.GROQ_API_KEY;
  process.env.OPENAI_BASE_URL = 'https://api.groq.com/openai/v1';
} else {
  console.error("Missing GROQ_API_KEY in .env");
  process.exit(1);
}

import { setTracingDisabled } from '@openai/agents-core';
import { Runner } from '@openai/agents';
import * as readline from 'readline';
import { managerAgent } from './agents/agents';

// Disable SDK tracing — it would otherwise try to POST to api.openai.com with our Groq key
setTracingDisabled(true);

const runner = new Runner();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("==========================================");
console.log("🤖 Multi-Agent Research System Initialized");
console.log("==========================================\n");
console.log("Agents:");
console.log("- Manager: Orchestrates the workflow");
console.log("- Research: Gathers facts using Tavily");
console.log("- Writer: Compiles the final report\n");
console.log("Type 'exit' or 'quit' to stop the application.\n");

function askQuestion() {
  rl.question('You: ', async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    try {
      // Execute the agent flow starting with the managerAgent
      const result = await runner.run(managerAgent, input);
      console.log(`\nAssistant: ${result.finalOutput}\n`);
    } catch (error) {
      console.error("\n[Error] Failed to process request:", error);
    }

    // Continue the loop
    askQuestion();
  });
}

askQuestion();
