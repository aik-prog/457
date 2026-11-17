/* Server lokal untuk mencoba website + API tanpa Vercel.
 *
 *   node tools/dev-server.js            lalu buka http://localhost:3000
 *
 * Bila KV_REST_API_URL tidak diisi, data disimpan di memori (hilang saat server dimatikan).
 * Kata sandi admin bawaan untuk lokal: admin12345 (ubah dengan ADMIN_PASSWORD=...).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345';

if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
  process.env.KV_REST_API_URL = 'http://memory.redis';
  process.env.KV_REST_API_TOKEN = 'dev';
  const str = new Map(), zs = new Map();
  const z = (k) => { if (!zs.has(k)) zs.set(k, new Map()); return zs.get(k); };
  const run = (c) => {
    const [cmd, ...a] = c; const op = String(cmd).toUpperCase();
    switch (op) {
      case 'GET': return str.has(a[0]) ? str.get(a[0]) : null;
      case 'SET': str.set(a[0], a[1]); return 'OK';
      case 'MGET': return a.map((k) => (str.has(k) ? str.get(k) : null));
      case 'DEL': return a.reduce((n, k) => n + (str.delete(k) ? 1 : 0) + (zs.delete(k) ? 1 : 0), 0);
      case 'INCR': { const v = Number(str.get(a[0]) || 0) + 1; str.set(a[0], String(v)); return v; }
      case 'EXPIRE': return 1;
      case 'ZADD': { const m = z(a[0]); for (let i = 1; i < a.length; i += 2) m.set(a[i + 1], Number(a[i])); return 1; }
      case 'ZREM': { const m = z(a[0]); return a.slice(1).reduce((n, k) => n + (m.delete(k) ? 1 : 0), 0); }
      case 'ZREVRANGE': { const arr = [...z(a[0]).entries()].sort((x, y) => y[1] - x[1]).map((e) => e[0]); const s = Number(a[1]), e = Number(a[2]); return arr.slice(s, e < 0 ? undefined : e + 1); }
      case 'ZRANGEBYSCORE': { const lo = a[1] === '-inf' ? -Infinity : Number(a[1]), hi = a[2] === '+inf' ? Infinity : Number(a[2]); return [...z(a[0]).entries()].filter((e) => e[1] >= lo && e[1] <= hi).sort((x, y) => x[1] - y[1]).map((e) => e[0]); }
      default: throw new Error('perintah belum didukung: ' + op);
    }
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opt) => {
    if (!String(url).startsWith('http://memory.redis')) return realFetch(url, opt);
    const body = JSON.parse(opt.body);
    let out;
    try { out = String(url).endsWith('/pipeline') ? body.map((c) => ({ result: run(c) })) : { result: run(body) }; }
    catch (e) { out = { error: e.message }; }
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  console.log('Penyimpanan: memori (data hilang saat server dimatikan)');
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };

function serveFile(res, file, status) {
  const stat = fs.statSync(file);
  res.writeHead(status || 200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Content-Length': stat.size });
  fs.createReadStream(file).pipe(res);
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(u.pathname);
  if (p.startsWith('/api/')) {
    const name = p.slice(5).replace(/[^a-z0-9_-]/gi, '');
    if (name.startsWith('_')) { res.writeHead(404); return res.end(); }
    const file = path.join(ROOT, 'api', name + '.js');
    if (fs.existsSync(file)) {
      try { await require(file)(req, res); }
      catch (e) { console.error(e); if (!res.headersSent) { res.writeHead(500); res.end('error'); } }
      return;
    }
  }
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return serveFile(res, file);
  return serveFile(res, path.join(ROOT, '404.html'), 404);
}).listen(PORT, () => console.log('Website lokal: http://localhost:' + PORT + '  (admin: /admin)'));
