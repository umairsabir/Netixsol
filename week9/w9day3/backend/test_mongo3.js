const mongoose = require('mongoose');
require('dotenv').config({ path: '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const p = await db.collection('playerinfos').findOne({ playerId: 43650 });
    console.log("Player 43650:", p);
    
    const p2 = await db.collection('playerinfos').findOne();
    console.log("Sample player:", p2);
  } finally {
    await mongoose.disconnect();
  }
}
run();
