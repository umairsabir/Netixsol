const { setTracingDisabled } = require('@openai/agents-core');
setTracingDisabled(true);

process.env.OPENAI_API_KEY = "test_key";
process.env.OPENAI_BASE_URL = "https://api.groq.com/openai/v1";

const { Agent, Runner } = require('@openai/agents');

const agent = new Agent({
  name: 'Test',
  model: 'llama3-70b-8192',
  instructions: 'Say hello'
});

async function run() {
  const runner = new Runner();
  try {
     const result = await runner.run(agent, "hello");
     console.log(result.finalOutput);
  } catch (err) {
     console.error(err.message);
  }
}
run();
