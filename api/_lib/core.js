'use strict';
/*
 * Fungsi bersama untuk semua endpoint di folder /api.
 * Penyimpanan: Upstash Redis lewat REST API (tanpa dependensi npm).
 * Variabel lingkungan yang dipakai:
 *   KV_REST_API_URL / KV_REST_API_TOKEN      (otomatis dari integrasi Upstash di Vercel)
 *   UPSTASH_REDIS_REST_URL / ..._TOKEN       (alternatif nama yang sama)
 *   ADMIN_PASSWORD                           (kata sandi halaman admin)
 *   AUTH_SECRET                              (opsional, kunci tanda tangan sesi)
 *   RESEND_API_KEY                           (opsional, untuk kirim email notifikasi)
 *   MAIL_TO, MAIL_FROM                       (opsional, alamat email notifikasi)
 */
const crypto = require('crypto');

const env = (k) => (process.env[k] || '').trim();
const KV_URL = () => env('KV_REST_API_URL') || env('UPSTASH_REDIS_REST_URL');
const KV_TOKEN = () => env('KV_REST_API_TOKEN') || env('UPSTASH_REDIS_REST_TOKEN');

function storageReady() { return !!(KV_URL() && KV_TOKEN()); }
function emailReady() { return !!env('RESEND_API_KEY'); }
function adminConfigured() { return env('ADMIN_PASSWORD').length >= 8; }

class HttpError extends Error {
  constructor(status, code, message) { super(message || code); this.status = status; this.code = code; }
}

async function kvFetch(path, body) {
  if (!storageReady()) throw new HttpError(503, 'storage_not_configured', 'Penyimpanan belum terhubung.');
  let r;
  try {
    r = await fetch(KV_URL().replace(/\/$/, '') + path, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KV_TOKEN(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    throw new HttpError(502, 'storage_unreachable', 'Penyimpanan tidak bisa dihubungi.');
  }
  const j = await r.json().catch(() => null);
  if (!r.ok || !j) throw new HttpError(502, 'storage_error', 'Penyimpanan menolak permintaan.');
  return j;
}
async function redis(...cmd) {
  const j = await kvFetch('', cmd.map(String));
  if (j.error) throw new HttpError(502, 'storage_error', j.error);
  return j.result;
}
async function pipeline(cmds) {
  const j = await kvFetch('/pipeline', cmds.map((c) => c.map(String)));
  if (!Array.isArray(j)) throw new HttpError(502, 'storage_error', 'Respons penyimpanan tidak dikenali.');
  return j.map((x) => (x && x.error ? null : x && x.result));
}

/* ---------- HTTP ---------- */
function send(res, status, obj, headers) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!headers || !headers['Cache-Control']) res.setHeader('Cache-Control', 'no-store');
  for (const k in headers || {}) res.setHeader(k, headers[k]);
  res.end(JSON.stringify(obj));
}
function fail(res, err) {
  if (err instanceof HttpError) return send(res, err.status, { error: err.code, message: err.message });
  console.error(err);
  return send(res, 500, { error: 'server_error', message: 'Terjadi kesalahan di server.' });
}
async function readJson(req, limit) {
  limit = limit || 64 * 1024;
  let b = req.body;
  if (b !== undefined && b !== null && typeof b === 'object' && !Buffer.isBuffer(b)) return b;
  if (typeof b === 'string' || Buffer.isBuffer(b)) {
    if (b.length > limit) throw new HttpError(413, 'too_large', 'Data terlalu besar.');
    try { return JSON.parse(b.toString() || '{}'); } catch (e) { throw new HttpError(400, 'bad_json', 'Format data tidak valid.'); }
  }
  const chunks = []; let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new HttpError(413, 'too_large', 'Data terlalu besar.');
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch (e) { throw new HttpError(400, 'bad_json', 'Format data tidak valid.'); }
}
function query(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  const u = new URL(req.url, 'http://x'); const o = {};
  u.searchParams.forEach((v, k) => { o[k] = v; });
  return o;
}
function allow(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  send(res, 405, { error: 'method_not_allowed' });
  return false;
}
/* permintaan yang mengubah data wajib membawa header ini; formulir dari situs lain tidak bisa menambahkannya */
function requireAjax(req) {
  if (req.headers['x-requested-with'] !== '457') throw new HttpError(403, 'forbidden', 'Permintaan ditolak.');
}
function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || String(req.headers['x-real-ip'] || '') || (req.socket && req.socket.remoteAddress) || 'unknown';
}
async function rateLimit(name, req, max, windowSec) {
  if (!storageReady()) return true;
  const ipHash = crypto.createHash('sha256').update(clientIp(req)).digest('hex').slice(0, 16);
  const key = 'rl:' + name + ':' + ipHash + ':' + Math.floor(Date.now() / 1000 / windowSec);
  const [count] = await pipeline([['INCR', key], ['EXPIRE', key, windowSec]]);
  return Number(count) <= max;
}

/* ---------- sesi admin ---------- */
const COOKIE = 'adm457';
const SESSION_DAYS = 7;
function secret() {
  return env('AUTH_SECRET') || crypto.createHash('sha256').update('457corp|' + env('ADMIN_PASSWORD') + '|' + KV_TOKEN()).digest('hex');
}
function sign(v) { return crypto.createHmac('sha256', secret()).update(v).digest('base64url'); }
function makeSession() {
  const exp = String(Date.now() + SESSION_DAYS * 86400 * 1000);
  return exp + '.' + sign(exp);
}
function parseCookies(req) {
  const o = {};
  String(req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('='); if (i < 0) return;
    o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return o;
}
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function isAdmin(req) {
  if (!adminConfigured()) return false;
  const t = parseCookies(req)[COOKIE]; if (!t) return false;
  const [exp, sig] = t.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}
function requireAdmin(req) {
  if (!isAdmin(req)) throw new HttpError(401, 'unauthorized', 'Silakan masuk sebagai admin.');
}
function cookieHeader(value, maxAge, req) {
  const secure = String(req.headers['x-forwarded-proto'] || '').includes('https') || process.env.VERCEL ? '; Secure' : '';
  return COOKIE + '=' + encodeURIComponent(value) + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + maxAge + secure;
}
function checkPassword(pw) { return adminConfigured() && safeEqual(String(pw || ''), env('ADMIN_PASSWORD')); }

/* ---------- validasi ---------- */
function str(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max); }
function newId(n) { return crypto.randomBytes(n || 8).toString('base64url'); }
const SRC_RE = /^(img\/[A-Za-z0-9._-]+|api\/img\?id=[A-Za-z0-9_-]+)$/;
const CATS = ['jalan', 'air', 'fo', 'mep'];

function normalizeContent(c) {
  if (!c || typeof c !== 'object') throw new HttpError(400, 'bad_content', 'Konten tidak valid.');
  const ct = c.contact || {};
  const contact = {
    person: str(ct.person, 60),
    phone: str(ct.phone, 30),
    wa: str(ct.wa, 20).replace(/\D/g, ''),
    email: str(ct.email, 120),
    address: str(ct.address, 300),
    maps: str(ct.maps, 500)
  };
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) throw new HttpError(400, 'bad_email', 'Alamat email tidak valid.');
  if (contact.maps && !/^https:\/\//.test(contact.maps)) throw new HttpError(400, 'bad_maps', 'Link Google Maps harus diawali https://');
  if (contact.wa && !/^\d{9,15}$/.test(contact.wa)) throw new HttpError(400, 'bad_wa', 'Nomor WhatsApp harus 9 sampai 15 digit, diawali kode negara (contoh 6285...).');
  const portfolio = (Array.isArray(c.portfolio) ? c.portfolio : []).slice(0, 300).map((p) => {
    const photos = (Array.isArray(p.photos) ? p.photos : []).slice(0, 24)
      .filter((f) => f && SRC_RE.test(f.src) && SRC_RE.test(f.thumb || f.src))
      .map((f) => ({ src: f.src, thumb: f.thumb || f.src }));
    return { id: str(p.id, 60).replace(/[^A-Za-z0-9_-]/g, '') || newId(5), title: str(p.title, 120), cat: CATS.includes(p.cat) ? p.cat : 'jalan', photos };
  }).filter((p) => p.title && p.photos.length);
  const clients = (Array.isArray(c.clients) ? c.clients : []).slice(0, 200).map((k) => ({
    id: str(k.id, 60).replace(/[^A-Za-z0-9_-]/g, '') || newId(5),
    name: str(k.name, 120),
    logo: SRC_RE.test(k.logo || '') ? k.logo : ''
  })).filter((k) => k.name || k.logo);
  return { version: 1, updatedAt: Date.now(), contact, portfolio, clients };
}
function referencedImages(content) {
  const ids = new Set();
  const add = (s) => { const m = /^api\/img\?id=([A-Za-z0-9_-]+)$/.exec(s || ''); if (m) ids.add(m[1]); };
  (content.portfolio || []).forEach((p) => (p.photos || []).forEach((f) => { add(f.src); add(f.thumb); }));
  (content.clients || []).forEach((k) => add(k.logo));
  return ids;
}

/* ---------- email (Resend) ---------- */
function escHtml(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!emailReady()) return { sent: false, reason: 'not_configured' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env('RESEND_API_KEY'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env('MAIL_FROM') || 'Website 457Corp <onboarding@resend.dev>', to: [to], subject, text, html, reply_to: replyTo || undefined })
    });
    if (!r.ok) { console.error('resend', r.status, await r.text().catch(() => '')); return { sent: false, reason: 'rejected' }; }
    return { sent: true };
  } catch (e) { console.error('resend', e); return { sent: false, reason: 'unreachable' }; }
}

module.exports = {
  HttpError, storageReady, emailReady, adminConfigured, redis, pipeline,
  send, fail, readJson, query, allow, requireAjax, clientIp, rateLimit,
  makeSession, isAdmin, requireAdmin, cookieHeader, checkPassword, SESSION_DAYS,
  str, newId, normalizeContent, referencedImages, sendEmail, escHtml, env
};
