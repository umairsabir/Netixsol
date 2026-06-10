const { ChatGroq } = require('@langchain/groq');
require('dotenv').config({ path: '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/backend/.env' });

async function run() {
  const llm = new ChatGroq({
    model: 'llama-3.1-8b-instant',
    apiKey: process.env.GROQ_API_KEY,
  });
  const res = await llm.invoke("I have a player with playerId 150804 who took 7 wickets in ODI matches in the year 2001. Who is this player?");
  console.log(res.content);
}
run();
