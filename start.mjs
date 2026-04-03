import { createServer } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '8080');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const server = createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  
  let filePath = join(DIST, urlPath);
  
  // Try exact file first
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    // Try with /index.html
    const withIndex = join(filePath, 'index.html');
    if (existsSync(withIndex)) {
      filePath = withIndex;
    } else {
      // 404
      const notFound = join(DIST, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html' });
      if (existsSync(notFound)) {
        createReadStream(notFound).pipe(res);
      } else {
        res.end('Not found');
      }
      return;
    }
  }
  
  const ext = extname(filePath);
  const contentType = MIME[ext] || 'text/plain';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
