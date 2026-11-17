'use strict';
// GET    /api/leads             daftar pesan masuk (admin)
// PATCH  /api/leads             {id, status} ubah status
// DELETE /api/leads?id=...      hapus pesan
const c = require('./_lib/core');
const STATUSES = ['baru', 'dihubungi', 'selesai'];

module.exports = async (req, res) => {
  if (!c.allow(req, res, ['GET', 'PATCH', 'DELETE'])) return;
  try {
    c.requireAdmin(req);
    if (req.method === 'GET') {
      const ids = (await c.redis('ZREVRANGE', 'leads', '0', '999')) || [];
      if (!ids.length) return c.send(res, 200, { leads: [] });
      const raws = await c.redis('MGET', ...ids.map((id) => 'lead:' + id));
      const leads = raws.map((r) => { try { return r ? JSON.parse(r) : null; } catch (e) { return null; } }).filter(Boolean);
      return c.send(res, 200, { leads });
    }
    c.requireAjax(req);
    if (req.method === 'PATCH') {
      const b = await c.readJson(req);
      const id = c.str(b.id, 40);
      if (!STATUSES.includes(b.status)) throw new c.HttpError(400, 'bad_status', 'Status tidak dikenal.');
      const raw = await c.redis('GET', 'lead:' + id);
      if (!raw) throw new c.HttpError(404, 'not_found', 'Pesan tidak ditemukan.');
      const lead = JSON.parse(raw); lead.status = b.status; lead.updatedAt = Date.now();
      await c.redis('SET', 'lead:' + id, JSON.stringify(lead));
      return c.send(res, 200, { ok: true, lead });
    }
    const id = c.str(c.query(req).id, 40);
    if (!id) throw new c.HttpError(400, 'bad_id', 'ID pesan kosong.');
    await c.pipeline([['DEL', 'lead:' + id], ['ZREM', 'leads', id]]);
    return c.send(res, 200, { ok: true });
  } catch (e) { return c.fail(res, e); }
};
