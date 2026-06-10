const mongoose = require('mongoose');
require('dotenv').config({ path: '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // check if there is a players collection
    const crp = await db.collection('cricketplayers').findOne();
    if(crp) console.log('Sample cricketplayers:', crp);
    else console.log('No cricketplayers found');
    
    const pinfo = await db.collection('players').findOne();
    if(pinfo) console.log('Sample players:', pinfo);

  } finally {
    await mongoose.disconnect();
  }
}
run();
