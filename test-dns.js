const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.cluster0.2wrssgu.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS SRV Resolution error:', err);
  } else {
    console.log('DNS SRV resolved to:', addresses);
  }
});
