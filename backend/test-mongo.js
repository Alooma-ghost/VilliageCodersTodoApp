const fs = require('fs');
const mongoose = require('mongoose');

const uri1 = 'mongodb+srv://8dFGOqwqzws6I65L:8dFGOqwqzws6I65L@cluster0.2wrssgu.mongodb.net/?appName=Cluster0';
const uri2 = 'mongodb+srv://8dFGOqwqzws6I65L:8dFGOqwqzws6I65L@cluster0.2wrssgu.mongodb.net/villagedb?retryWrites=true&w=majority&appName=Cluster0';

let log = '';
function record(msg) {
  console.log(msg);
  log += msg + '\n';
  fs.writeFileSync('mongo-result.txt', log);
}

async function test(uri, label) {
  record(`Testing ${label}...`);
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    record(`✅ ${label} CONNECTED: ${conn.connection.host}`);
    await mongoose.disconnect();
  } catch (err) {
    record(`❌ ${label} ERROR: ${err.message}`);
  }
}

async function start() {
  await test(uri1, 'URI 1');
  await test(uri2, 'URI 2');
  record('DONE');
  process.exit(0);
}

start();
