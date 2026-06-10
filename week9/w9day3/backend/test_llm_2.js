const { ChatGroq } = require('@langchain/groq');
require('dotenv').config({ path: '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/backend/.env' });

async function run() {
  const llm = new ChatGroq({
    model: 'llama-3.1-8b-instant',
    apiKey: process.env.GROQ_API_KEY,
  });
  const res = await llm.invoke("I have a cricket query result for 'Top 5 run scorers in Test'. The top 5 are: 1. playerId 35320 with 15921 runs, 2. playerId 4174 with 13378 runs, 3. playerId 5390 with 13289 runs, 4. playerId 4461 with 11953 runs, 5. playerId 56143 with 12400 runs. Can you tell me their names?");
  console.log(res.content);
}
run();
