// Local-only preview. No packages, build, telemetry, or external connections.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif'};
const allowed = new Set(['index.html','standalone.html','style.css','motion.css','gallery.css','decor.css','app.js','core.js','content.js','art.js','motion.js','music.js','gallery.js','decor.js','backup.js','favicon.svg','guides.js','guides.css','creator.js','creator.css','assets/bird-lutino.webp','assets/bird-gray.webp','assets/bird-pearl.webp','assets/lutino-walk.gif','assets/lutino-flight.gif','assets/lutino-care.gif']);
const server = http.createServer((req,res)=>{
  let file;
  try { file = decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'') || 'index.html'; }
  catch { res.writeHead(400);res.end('Bad request');return; }
  const fromPublic=file.startsWith('docs/');if(fromPublic)file=file.slice(5)||'index.html';
  if (!allowed.has(file)) {res.writeHead(404);res.end('Not found');return;}
  fs.readFile(path.join(__dirname,fromPublic?'docs':'',file),(err,data)=>{
    if(err){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
  });
});
server.on('error',e=>{console.error('Preview could not start:',e.code);process.exitCode=1;});
server.listen(4173,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:4173 (Ctrl+C to stop)'));
