const net = require('net');

const client = new net.Socket();
client.setTimeout(5000);

console.log('Testing TCP connection to ac-3tsvvsi-shard-00-00.2wrssgu.mongodb.net:27017...');

client.connect(27017, 'ac-3tsvvsi-shard-00-00.2wrssgu.mongodb.net', () => {
  console.log('✅ TCP connection succeeded! Port 27017 is open and accessible.');
  client.destroy();
});

client.on('error', (err) => {
  console.error('❌ TCP Connection failed:', err.message);
});

client.on('timeout', () => {
  console.error('❌ TCP Connection timed out (Atlas IP Whitelist is likely blocking this IP)');
  client.destroy();
});
