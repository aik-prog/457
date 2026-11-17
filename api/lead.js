'use strict';
// POST /api/lead  permintaan penawaran dari pengunjung
const c = require('./_lib/core');

const STATUS = 'baru';
function code() {
  const d = new Date(Date.now() + 7 * 3600 * 1000); // WIB
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = ''; for (let i = 0; i < 4; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return 'PN-' + ymd + '-' + s;
}

module.exports = async (req, res) => {
  if (!c.allow(req, res, ['POST'])) return;
  try {
    c.requireAjax(req);
    const b = await c.readJson(req, 16 * 1024);
    if (c.str(b.website, 200)) return c.send(res, 200, { ok: true, code: '-' }); // jebakan bot
    const lead = {
      nama: c.str(b.nama, 80), org: c.str(b.org, 120), hp: c.str(b.hp, 30),
      jenis: c.str(b.jenis, 80), lokasi: c.str(b.lokasi, 160), mulai: c.str(b.mulai, 60), detail: c.str(b.detail, 2000)
    };
    const digits = lead.hp.replace(/\D/g, '');
    if (lead.nama.length < 2) throw new c.HttpError(400, 'bad_nama', 'Isi nama Anda.');
    if (digits.length < 8 || digits.length > 15) throw new c.HttpError(400, 'bad_hp', 'Nomor WhatsApp harus 8 sampai 15 digit.');
    if (!lead.jenis) throw new c.HttpError(400, 'bad_jenis', 'Pilih jenis pekerjaan.');
    if (!c.storageReady()) throw new c.HttpError(503, 'storage_not_configured', 'Server belum siap menerima pesan.');
    if (!(await c.rateLimit('lead', req, 5, 600))) throw new c.HttpError(429, 'too_many', 'Terlalu banyak pengiriman. Coba lagi beberapa menit lagi.');

    const id = c.newId(9), now = Date.now();
    Object.assign(lead, { id, code: code(), createdAt: now, status: STATUS, emailed: false });
    await c.pipeline([['SET', 'lead:' + id, JSON.stringify(lead)], ['ZADD', 'leads', now, id]]);

    let to = c.env('MAIL_TO');
    if (!to) { try { const raw = await c.redis('GET', 'content'); to = raw ? (JSON.parse(raw).contact || {}).email : ''; } catch (e) {} }
    to = to || 'cvempatlimatujuh@gmail.com';
    const rows = [['Kode', lead.code], ['Nama', lead.nama], ['Instansi', lead.org || '-'], ['WhatsApp', lead.hp], ['Jenis pekerjaan', lead.jenis],
      ['Lokasi proyek', lead.lokasi || '-'], ['Rencana mulai', lead.mulai || 'Belum ditentukan'], ['Rincian', lead.detail || '-']];
    const text = 'Permintaan penawaran baru dari website 457Corp\n\n' + rows.map((r) => r[0] + ': ' + r[1]).join('\n') +
      '\n\nBalas lewat WhatsApp: https://wa.me/' + digits.replace(/^0/, '62');
    const html = '<p>Permintaan penawaran baru dari website 457Corp.</p><table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
      rows.map((r) => '<tr><td style="color:#5d6874;vertical-align:top">' + c.escHtml(r[0]) + '</td><td style="white-space:pre-wrap">' + c.escHtml(r[1]) + '</td></tr>').join('') +
      '</table><p><a href="https://wa.me/' + digits.replace(/^0/, '62') + '">Balas lewat WhatsApp</a></p>';
    const mail = await c.sendEmail({ to, subject: 'Permintaan penawaran: ' + lead.jenis + ' (' + lead.nama + ')', text, html });
    if (mail.sent) { lead.emailed = true; await c.redis('SET', 'lead:' + id, JSON.stringify(lead)); }
    return c.send(res, 200, { ok: true, code: lead.code, emailed: mail.sent });
  } catch (e) { return c.fail(res, e); }
};
