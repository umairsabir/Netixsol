const { ChatGroq } = require('@langchain/groq');
require('dotenv').config({ path: '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/backend/.env' });

async function run() {
  const llm = new ChatGroq({
    model: 'llama-3.1-8b-instant',
    apiKey: process.env.GROQ_API_KEY,
  });
  const prompt = `You are a cricket expert. I have the following database results for the question "Top Batsman in Test 2006". The results are:
[{ playerId: 43650, runs: 1788, matches: 11, average: 99.33, hundreds: 9, fifties: 3 }]
Using your knowledge of cricket history, infer the player's name (e.g., who scored 1788 runs in Tests in 2006? Mohammad Yousuf) and replace the playerId with their actual name. Format the output as a clean Markdown table. DO NOT mention that you inferred the name.`;
  const res = await llm.invoke(prompt);
  console.log(res.content);
}
run();
