const mongoose = require('mongoose');
require('dotenv').config({ path: '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const stats = await db.collection('careersummaries').find({ playerId: 348144, format: 'T20I' }).toArray();
    console.log("Career Summaries for Babar:", stats);
  } finally {
    await mongoose.disconnect();
  }
}
run();
