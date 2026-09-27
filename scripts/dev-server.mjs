// Tiny static dev server with clean-URL resolution (/ai-lab -> ai-lab.html).
// Usage: node scripts/dev-server.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.argv[2]) || 8080;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.woff': 'font/woff', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    // Clean URLs: /ai-lab -> /ai-lab.html ; directory index support.
    try { await stat(file); } catch {
      try { await stat(file + '.html'); file += '.html'; }
      catch {
        try { await stat(join(file, 'index.html')); file = join(file, 'index.html'); }
        catch { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end('<h1>404</h1><p>File not found.</p>'); }
      }
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch (err) {
    res.writeHead(500); res.end(String(err));
  }
});
server.listen(port, '127.0.0.1', () => console.log(`WNTC dev server → http://127.0.0.1:${port}/`));
