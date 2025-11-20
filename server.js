// Minimal static file server that opens the browser
// Usage: npm start

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

const root = __dirname;
const DEFAULT_FILE = 'index.html';
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function resolvePath(reqUrl) {
  const parsed = url.parse(reqUrl || '/');
  let pathname = decodeURIComponent(parsed.pathname || '/');
  if (pathname.endsWith('/')) pathname += DEFAULT_FILE;
  // Prevent path traversal
  const filePath = path.join(root, pathname);
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Cache-Control': 'no-cache', ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url);
  if (!filePath) {
    return send(res, 400, 'Bad Request');
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      if (req.url === '/' || req.url === '') {
        // If index.html missing, show basic message
        return send(res, 200, '<!doctype html><title>Sand Picture</title><p>index.html not found.</p>', { 'Content-Type': 'text/html; charset=utf-8' });
      }
      return send(res, 404, 'Not Found');
    }
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, DEFAULT_FILE);
      fs.readFile(indexPath, (e, data) => {
        if (e) return send(res, 404, 'Not Found');
        return send(res, 200, data, { 'Content-Type': MIME['.html'] });
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    fs.readFile(filePath, (e, data) => {
      if (e) return send(res, 500, 'Internal Server Error');
      send(res, 200, data, { 'Content-Type': type });
    });
  });
});

function openBrowser(address) {
  const platform = process.platform;
  let cmd, args;
  if (platform === 'darwin') {
    cmd = 'open';
    args = [address];
  } else if (platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '', address];
  } else {
    cmd = 'xdg-open';
    args = [address];
  }
  const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
  child.unref();
}

function listen(port) {
  return new Promise((resolve) => {
    server.once('error', (e) => {
      if (e && e.code === 'EADDRINUSE') {
        resolve(null);
      } else {
        console.error('Server error:', e);
        process.exitCode = 1;
      }
    });
    server.listen(port, () => resolve(port));
  });
}

(async () => {
  let port = await listen(PORT);
  if (!port) {
    // Try a random high port if default in use
    const alt = 5000 + Math.floor(Math.random() * 1000);
    port = await listen(alt);
  }
  if (!port) {
    console.error('Failed to start server');
    process.exit(1);
  }
  const address = `http://localhost:${port}/`;
  console.log(`Sand Picture Emulator running at ${address}`);
  try { openBrowser(address); } catch (e) { /* ignore */ }
})();
