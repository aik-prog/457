'use strict';
// GET /api/img?id=...  tampilkan foto yang diunggah admin
const c = require('./_lib/core');

module.exports = async (req, res) => {
  if (!c.allow(req, res, ['GET'])) return;
  try {
    const id = c.str(c.query(req).id, 40);
    if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new c.HttpError(400, 'bad_id', 'ID foto tidak valid.');
    const raw = await c.redis('GET', 'img:' + id);
    if (!raw) throw new c.HttpError(404, 'not_found', 'Foto tidak ditemukan.');
    const i = raw.indexOf(';');
    const buf = Buffer.from(raw.slice(i + 1), 'base64');
    res.statusCode = 200;
    res.setHeader('Content-Type', raw.slice(0, i));
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(buf);
  } catch (e) { return c.fail(res, e); }
};
