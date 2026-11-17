'use strict';
// POST   /api/login   {password}  masuk admin
// DELETE /api/login              keluar
const c = require('./_lib/core');

module.exports = async (req, res) => {
  if (!c.allow(req, res, ['POST', 'DELETE'])) return;
  try {
    c.requireAjax(req);
    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', c.cookieHeader('', 0, req));
      return c.send(res, 200, { ok: true });
    }
    if (!c.adminConfigured()) throw new c.HttpError(503, 'admin_not_configured', 'Kata sandi admin belum diatur di Vercel (ADMIN_PASSWORD, minimal 8 karakter).');
    if (!(await c.rateLimit('login', req, 8, 900))) throw new c.HttpError(429, 'too_many', 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.');
    const b = await c.readJson(req, 4096);
    if (!c.checkPassword(b.password)) throw new c.HttpError(401, 'wrong_password', 'Kata sandi salah.');
    res.setHeader('Set-Cookie', c.cookieHeader(c.makeSession(), c.SESSION_DAYS * 86400, req));
    return c.send(res, 200, { ok: true });
  } catch (e) { return c.fail(res, e); }
};
