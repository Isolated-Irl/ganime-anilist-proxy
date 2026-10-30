const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://ganime.pages.dev');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  let body = '';
  req.on('data', c => body += c);
  req.on('end', async () => {
    try {
      const { code, redirect_uri } = JSON.parse(body);
      const r = await fetch('https://anilist.co/api/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'GAnime/1.0 (https://ganime.pages.dev)',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.ANILIST_CLIENT_ID,
          client_secret: process.env.ANILIST_CLIENT_SECRET,
          redirect_uri, code,
        }),
      });
      const data = await r.text();
      res.writeHead(r.status, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'proxy_failed' }));
    }
  });
});
server.listen(PORT);
console.log('Listening on ' + PORT);
