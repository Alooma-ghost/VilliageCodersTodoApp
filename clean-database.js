const fs = require('fs');
const path = require('path');
const mongoose = require('./backend/node_modules/mongoose');

const localDbPath = path.join(__dirname, 'backend/data/local_db.json');

// 1. Wipe local_db.json
const emptyDb = { users: [], tasks: [] };
fs.writeFileSync(localDbPath, JSON.stringify(emptyDb, null, 2));
console.log('✅ Local storage (local_db.json) wiped clean: 0 users, 0 tasks.');

// 2. Wipe MongoDB Atlas if reachable
const uri = 'mongodb+srv://8dFGOqwqzws6I65L:8dFGOqwqzws6I65L@cluster0.2wrssgu.mongodb.net/villagedb?retryWrites=true&w=majority&appName=Cluster0';

async function wipeMongo() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected to MongoDB Atlas!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const colNames = collections.map(c => c.name);

    if (colNames.includes('users')) {
      const uRes = await mongoose.connection.db.collection('users').deleteMany({});
      console.log(`✅ Deleted ${uRes.deletedCount} user(s) from MongoDB Atlas.`);
    }

    if (colNames.includes('tasks')) {
      const tRes = await mongoose.connection.db.collection('tasks').deleteMany({});
      console.log(`✅ Deleted ${tRes.deletedCount} task(s) from MongoDB Atlas.`);
    }

    console.log('🎉 MongoDB Atlas wiped completely clean!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas direct wipe skipped/failed:', err.message);
    console.log('💡 Note: When pushed to Render, you can also visit: https://villiagecoderstodoapp.onrender.com/api/auth/reset-database');
    process.exit(0);
  }
}

wipeMongo();
