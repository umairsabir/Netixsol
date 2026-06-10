const mongoose = require('mongoose');
require('dotenv').config({ path: '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const pmatch = await db.collection('playermatches').findOne();
    console.log('Sample playermatch:', pmatch);
  } finally {
    await mongoose.disconnect();
  }
}
run();
