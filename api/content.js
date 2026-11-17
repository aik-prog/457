'use strict';
// GET  /api/content          konten publik (null bila belum pernah disimpan admin)
// GET  /api/content?draft=1  konten untuk admin, tanpa cache
// PUT  /api/content          simpan konten (admin)
const c = require('./_lib/core');

module.exports = async (req, res) => {
  if (!c.allow(req, res, ['GET', 'PUT'])) return;
  try {
    if (req.method === 'GET') {
      const draft = c.query(req).draft === '1';
      if (draft) c.requireAdmin(req);
      if (!c.storageReady()) return c.send(res, 200, { content: null, storage: false });
      const raw = await c.redis('GET', 'content');
      return c.send(res, 200, { content: raw ? JSON.parse(raw) : null, storage: true },
        draft ? {} : { 'Cache-Control': 'public, max-age=0, s-maxage=15, stale-while-revalidate=60' });
    }
    c.requireAdmin(req); c.requireAjax(req);
    const body = await c.readJson(req, 512 * 1024);
    const content = c.normalizeContent(body.content);
    await c.redis('SET', 'content', JSON.stringify(content));
    // bersihkan foto unggahan yang tidak dipakai lagi (yang berumur lebih dari 6 jam)
    try {
      const used = c.referencedImages(content);
      const old = await c.redis('ZRANGEBYSCORE', 'imgs', '-inf', String(Date.now() - 6 * 3600 * 1000));
      const drop = (old || []).filter((id) => !used.has(id));
      if (drop.length) await c.pipeline([['DEL', ...drop.map((id) => 'img:' + id)], ['ZREM', 'imgs', ...drop]]);
    } catch (e) { console.error('cleanup', e); }
    return c.send(res, 200, { ok: true, content });
  } catch (e) { return c.fail(res, e); }
};
