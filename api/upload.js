'use strict';
// POST /api/upload  {data: "data:image/webp;base64,..."}  simpan foto (admin)
const c = require('./_lib/core');
const TYPES = ['image/webp', 'image/jpeg', 'image/png'];
const MAX = 900 * 1024;

module.exports = async (req, res) => {
  if (!c.allow(req, res, ['POST'])) return;
  try {
    c.requireAdmin(req); c.requireAjax(req);
    const b = await c.readJson(req, 1400 * 1024);
    const m = /^data:([a-z/]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
    if (!m || !TYPES.includes(m[1])) throw new c.HttpError(400, 'bad_image', 'Format foto harus WebP, JPEG, atau PNG.');
    const bytes = Buffer.from(m[2], 'base64');
    if (bytes.length > MAX) throw new c.HttpError(413, 'too_large', 'Ukuran foto maksimal 900 KB setelah dikompres.');
    const id = c.newId(10);
    await c.pipeline([['SET', 'img:' + id, m[1] + ';' + m[2]], ['ZADD', 'imgs', Date.now(), id]]);
    return c.send(res, 200, { ok: true, src: 'api/img?id=' + id });
  } catch (e) { return c.fail(res, e); }
};
