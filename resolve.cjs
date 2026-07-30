const dns = require('dns');

// Force Google DNS to bypass local ISP blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);

dns.resolveSrv('_mongodb._tcp.cluster0.x91pcbg.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV Error:', err);
    return;
  }
  console.log('Resolved SRV addresses:');
  console.log(addresses);
  
  dns.resolveTxt('cluster0.x91pcbg.mongodb.net', (err, txt) => {
    if (err) {
      console.error('TXT Error:', err);
      return;
    }
    console.log('Resolved TXT records:');
    console.log(txt);
  });
});
