'use strict';
// GET /api/me  status sesi dan konfigurasi server
const c = require('./_lib/core');

module.exports = async (req, res) => {
  if (!c.allow(req, res, ['GET'])) return;
  const admin = c.isAdmin(req);
  const out = { admin, adminConfigured: c.adminConfigured(), storage: c.storageReady() };
  if (admin) { out.email = c.emailReady(); out.mailTo = c.env('MAIL_TO') || null; }
  return c.send(res, 200, out);
};
