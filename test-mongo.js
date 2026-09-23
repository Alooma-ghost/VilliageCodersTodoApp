const mongoose = require('mongoose');

const uri1 = 'mongodb+srv://8dFGOqwqzws6I65L:8dFGOqwqzws6I65L@cluster0.2wrssgu.mongodb.net/?appName=Cluster0';
const uri2 = 'mongodb+srv://8dFGOqwqzws6I65L:8dFGOqwqzws6I65L@cluster0.2wrssgu.mongodb.net/villagedb?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection(uri, label) {
  console.log(`Testing ${label}...`);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ ${label} CONNECTED! Host: ${conn.connection.host}`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ ${label} Error:`, err.message);
    return false;
  }
}

async function run() {
  await testConnection(uri1, 'URI without DB path');
  await testConnection(uri2, 'URI with villagedb');
}

run();
