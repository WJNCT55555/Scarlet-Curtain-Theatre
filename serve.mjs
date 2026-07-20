import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.argv[2] || 8765);
const host = process.argv[3] || '127.0.0.1';
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.map':'application/json; charset=utf-8' };

createServer((request, response) => {
  try {
    const relative = decodeURIComponent((request.url || '/').split('?')[0]);
    let file = normalize(join(root, relative));
    if (!file.startsWith(normalize(root))) throw new Error('outside root');
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
}).listen(port, host, () => console.log(`http://${host}:${port}/theatre-lobby/`));
