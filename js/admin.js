/* Halaman admin CV. Empat Lima Tujuh */
(function(){
'use strict';
var $ = function(s, r){ return (r||document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
var CATS = {jalan:'Jalan & fasilitas jalan', air:'Drainase & penanganan tanah', fo:'Jaringan fiber optik', mep:'Mekanikal, elektrikal & plumbing'};
var STATUS = {baru:'Baru', dihubungi:'Dihubungi', selesai:'Selesai'};
var S = {me:null, content:null, leads:[], filter:'semua', q:''};

/* ---------- utilitas ---------- */
function api(method, path, body){
  return fetch(path, {method:method, credentials:'same-origin', headers: body !== undefined ? {'Content-Type':'application/json','X-Requested-With':'457'} : {'X-Requested-With':'457'}, body: body !== undefined ? JSON.stringify(body) : undefined})
    .then(function(r){
      var isJson = /json/.test(r.headers.get('content-type') || '');
      return (isJson ? r.json() : Promise.resolve(null)).then(function(j){
        if (!isJson) { var e0 = new Error('Server admin tidak tersedia di alamat ini.'); e0.code = 'no_api'; e0.status = r.status; throw e0; }
        if (!r.ok) { var e = new Error((j && j.message) || 'Permintaan gagal.'); e.code = j && j.error; e.status = r.status; throw e; }
        return j;
      });
    });
}
var toastT = 0;
function toast(msg, isErr){ var t = $('#toast'); t.textContent = msg; t.classList.toggle('err', !!isErr); t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove('show'); }, isErr ? 5200 : 2600); }
function busy(btn, on){ if (!btn) return; btn.disabled = on; btn.classList.toggle('loading', on); }
function onAuthError(e){ if (e && e.status === 401) { toast('Sesi berakhir. Silakan masuk lagi.', true); showLogin(); return true; } return false; }
function fmtDate(ts){
  try { return new Date(ts).toLocaleString('id-ID', {timeZone:'Asia/Jakarta', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) + ' WIB'; }
  catch(e){ return new Date(ts).toISOString(); }
}
function waNumber(hp){ var d = String(hp||'').replace(/\D/g,''); if (d.charAt(0) === '0') d = '62' + d.slice(1); else if (d.charAt(0) === '8') d = '62' + d; return d; }
function uid(){ return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
function slug(s){ return String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0, 40) || uid(); }

/* modal */
var openModal = null;
function showModal(el){ el.hidden = false; openModal = el; var f = $('input, select, button', el); if (f) setTimeout(function(){ f.focus(); }, 30); }
function hideModal(el){ el.hidden = true; if (openModal === el) openModal = null; }
$$('.modal').forEach(function(m){
  m.addEventListener('click', function(e){ if (e.target === m || e.target.closest('[data-close]')) hideModal(m); });
});
document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && openModal) hideModal(openModal); });
function confirmBox(title, text, okLabel){
  return new Promise(function(res){
    var m = $('#confirm'); $('#cf-title').textContent = title; $('#cf-text').textContent = text; $('#cf-ok').textContent = okLabel || 'Hapus';
    var done = function(v){ m.removeEventListener('click', onClick); hideModal(m); res(v); };
    var onClick = function(e){ if (e.target.id === 'cf-ok') done(true); else if (e.target === m || e.target.closest('[data-close]')) done(false); };
    m.addEventListener('click', onClick);
    showModal(m); $('#cf-ok').focus();
  });
}

/* ---------- masuk / keluar ---------- */
function showLogin(msg){
  $('#app').hidden = true; $('#login').hidden = false;
  var cfg = $('#login-cfg');
  cfg.classList.remove('show'); cfg.textContent = '';
  if (msg) { cfg.textContent = msg; cfg.classList.add('show'); }
  else if (S.me && !S.me.adminConfigured) { cfg.textContent = 'Kata sandi admin belum diatur. Tambahkan variabel ADMIN_PASSWORD (minimal 8 karakter) di Vercel: Project 457, Settings, Environment Variables, lalu deploy ulang.'; cfg.classList.add('show'); }
  setTimeout(function(){ $('#pw').focus(); }, 50);
}
$('#login-form').addEventListener('submit', function(e){
  e.preventDefault();
  var btn = $('#login-btn'), err = $('#login-err'); err.textContent = '';
  if (!$('#pw').value) { err.textContent = 'Isi kata sandi.'; return; }
  busy(btn, true);
  api('POST', 'api/login', {password: $('#pw').value}).then(function(){ $('#pw').value = ''; return boot(); })
    .catch(function(e){ err.textContent = e.message; }).then(function(){ busy(btn, false); });
});
$('#logout').addEventListener('click', function(){
  api('DELETE', 'api/login').catch(function(){}).then(function(){ S.me = Object.assign({}, S.me, {admin:false}); showLogin(); });
});

function boot(){
  return api('GET', 'api/me').then(function(me){
    S.me = me;
    if (!me.admin) { showLogin(); return; }
    $('#login').hidden = true; $('#app').hidden = false;
    renderStatus();
    return Promise.all([loadContent(), loadLeads()]);
  }).catch(function(e){
    showLogin(e.code === 'no_api' ? 'Halaman admin hanya berjalan di website utama yang memakai server Vercel (457-gold.vercel.app).' : 'Server tidak bisa dihubungi. Coba muat ulang halaman.');
    $('#login-btn').disabled = e.code === 'no_api';
  });
}
function renderStatus(){
  var me = S.me, h = '';
  if (!me.storage) h += '<div class="notice n-warn"><div><b>Penyimpanan belum terhubung</b>Pesan masuk dan perubahan konten belum bisa disimpan. Di Vercel, buka Project 457, Storage, lalu buat database <code>Upstash for Redis</code> (paket gratis) dan hubungkan ke project ini. Setelah itu deploy ulang.</div></div>';
  if (me.storage && !me.email) h += '<div class="notice n-info"><div><b>Notifikasi email belum aktif</b>Pesan masuk tetap tersimpan di halaman ini. Untuk menerima email setiap ada pesan baru, tambahkan <code>RESEND_API_KEY</code> di Environment Variables Vercel.</div></div>';
  $('#a-status').innerHTML = h;
}

/* ---------- tab ---------- */
$$('.a-tabs button').forEach(function(b){
  b.addEventListener('click', function(){
    $$('.a-tabs button').forEach(function(x){ x.setAttribute('aria-selected', String(x === b)); });
    $$('.tab').forEach(function(t){ t.hidden = t.id !== 'tab-' + b.getAttribute('data-tab'); });
    if (b.getAttribute('data-tab') === 'leads') loadLeads();
  });
});

/* ---------- pesan masuk ---------- */
function loadLeads(){
  if (!S.me || !S.me.storage) { renderLeads(); return Promise.resolve(); }
  return api('GET', 'api/leads').then(function(j){ S.leads = j.leads || []; renderLeads(); })
    .catch(function(e){ if (!onAuthError(e)) { $('#leads').innerHTML = '<div class="empty"><b>Pesan belum bisa dimuat</b>' + esc(e.message) + '</div>'; } });
}
function renderLeads(){
  var counts = {semua:S.leads.length, baru:0, dihubungi:0, selesai:0};
  S.leads.forEach(function(l){ counts[l.status] = (counts[l.status] || 0) + 1; });
  $$('#lead-filter button').forEach(function(b){ $('span', b).textContent = counts[b.getAttribute('data-s')] || 0; b.setAttribute('aria-pressed', String(b.getAttribute('data-s') === S.filter)); });
  var cnt = $('#cnt-new'); cnt.textContent = counts.baru; cnt.hidden = !counts.baru;
  var q = S.q.toLowerCase();
  var list = S.leads.filter(function(l){
    if (S.filter !== 'semua' && l.status !== S.filter) return false;
    if (!q) return true;
    return [l.nama, l.org, l.hp, l.jenis, l.lokasi, l.detail, l.code].join(' ').toLowerCase().indexOf(q) >= 0;
  });
  var box = $('#leads');
  if (!S.me.storage) { box.innerHTML = '<div class="empty"><b>Belum ada penyimpanan</b>Hubungkan Upstash Redis di Vercel agar pesan dari form tersimpan di sini.</div>'; return; }
  if (!list.length) { box.innerHTML = '<div class="empty"><b>' + (S.leads.length ? 'Tidak ada pesan yang cocok' : 'Belum ada pesan masuk') + '</b>' + (S.leads.length ? 'Ubah saringan atau kata pencarian.' : 'Permintaan dari halaman Kontak akan muncul di sini.') + '</div>'; return; }
  box.innerHTML = list.map(function(l){
    var reply = 'https://wa.me/' + waNumber(l.hp) + '?text=' + encodeURIComponent('Halo ' + l.nama + ', terima kasih sudah menghubungi CV. Empat Lima Tujuh terkait ' + l.jenis + ' (kode ' + l.code + '). ');
    return '<article class="lead st-' + esc(l.status) + '" data-id="' + esc(l.id) + '">' +
      '<div class="lead-top"><div><h3>' + esc(l.nama) + (l.org ? ' <span class="meta">dari ' + esc(l.org) + '</span>' : '') + '</h3>' +
      '<span class="meta">' + esc(l.code) + ', ' + fmtDate(l.createdAt) + (l.emailed ? ', email terkirim' : '') + '</span></div>' +
      '<select aria-label="Status pesan" data-act="status">' + Object.keys(STATUS).map(function(k){ return '<option value="' + k + '"' + (k === l.status ? ' selected' : '') + '>' + STATUS[k] + '</option>'; }).join('') + '</select></div>' +
      '<dl><div><dt>WhatsApp</dt><dd>' + esc(l.hp) + '</dd></div><div><dt>Jenis pekerjaan</dt><dd>' + esc(l.jenis) + '</dd></div>' +
      '<div><dt>Lokasi proyek</dt><dd>' + esc(l.lokasi || '-') + '</dd></div><div><dt>Rencana mulai</dt><dd>' + esc(l.mulai || 'Belum ditentukan') + '</dd></div>' +
      (l.detail ? '<div class="detail"><dt>Rincian</dt><dd>' + esc(l.detail) + '</dd></div>' : '') + '</dl>' +
      '<div class="lead-acts"><a class="btn btn-wa sm" href="' + esc(reply) + '" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg>Balas lewat WhatsApp</a>' +
      '<button class="btn btn-line sm" type="button" data-act="del"><svg class="ic"><use href="#i-del"/></svg>Hapus</button></div></article>';
  }).join('');
}
$('#lead-filter').addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; S.filter = b.getAttribute('data-s'); renderLeads(); });
$('#lead-q').addEventListener('input', function(){ S.q = this.value.trim(); renderLeads(); });
$('#lead-refresh').addEventListener('click', function(){ var b = this; busy(b, true); loadLeads().then(function(){ busy(b, false); toast('Pesan dimuat ulang'); }); });
$('#leads').addEventListener('change', function(e){
  var sel = e.target.closest('[data-act="status"]'); if (!sel) return;
  var card = sel.closest('.lead'), id = card.getAttribute('data-id'), lead = S.leads.find(function(l){ return l.id === id; });
  var prev = lead.status; lead.status = sel.value; renderLeads();
  api('PATCH', 'api/leads', {id:id, status:sel.value}).then(function(){ toast('Status diubah menjadi ' + STATUS[lead.status]); })
    .catch(function(err){ if (!onAuthError(err)) { lead.status = prev; renderLeads(); toast(err.message, true); } });
});
$('#leads').addEventListener('click', function(e){
  var b = e.target.closest('[data-act="del"]'); if (!b) return;
  var id = b.closest('.lead').getAttribute('data-id'), lead = S.leads.find(function(l){ return l.id === id; });
  confirmBox('Hapus pesan dari ' + lead.nama + '?', 'Pesan ini akan dihapus permanen dari penyimpanan dan tidak bisa dikembalikan.').then(function(ok){
    if (!ok) return;
    api('DELETE', 'api/leads?id=' + encodeURIComponent(id)).then(function(){ S.leads = S.leads.filter(function(l){ return l.id !== id; }); renderLeads(); toast('Pesan dihapus'); })
      .catch(function(err){ if (!onAuthError(err)) toast(err.message, true); });
  });
});
$('#lead-csv').addEventListener('click', function(){
  if (!S.leads.length) { toast('Belum ada pesan untuk diunduh', true); return; }
  var cols = [['code','Kode'],['createdAt','Tanggal'],['status','Status'],['nama','Nama'],['org','Instansi'],['hp','WhatsApp'],['jenis','Jenis pekerjaan'],['lokasi','Lokasi'],['mulai','Rencana mulai'],['detail','Rincian']];
  var q = function(v){ v = String(v == null ? '' : v); return '"' + v.replace(/"/g, '""') + '"'; };
  var csv = '﻿' + cols.map(function(c){ return q(c[1]); }).join(',') + '\n' + S.leads.map(function(l){
    return cols.map(function(c){ return q(c[0] === 'createdAt' ? fmtDate(l.createdAt) : c[0] === 'status' ? STATUS[l.status] : l[c[0]]); }).join(',');
  }).join('\n');
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
  a.download = 'pesan-masuk-457corp-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
});
setInterval(function(){ if (!document.hidden && S.me && S.me.admin && !$('#tab-leads').hidden) loadLeads(); }, 60000);

/* ---------- konten ---------- */
function loadContent(){
  return api('GET', 'api/content?draft=1').then(function(j){ return j.content; }).catch(function(e){ if (onAuthError(e)) throw e; return null; })
    .then(function(c){ return c || fetch('data/content.json', {cache:'no-store'}).then(function(r){ return r.json(); }); })
    .then(function(c){ S.content = c; renderPortfolio(); renderClients(); fillContact(); })
    .catch(function(e){ toast('Konten gagal dimuat: ' + e.message, true); });
}
var saving = Promise.resolve();
function persist(okMsg){
  if (!S.me.storage) { toast('Belum tersimpan: penyimpanan belum terhubung di Vercel.', true); return Promise.reject(new Error('no_storage')); }
  var snapshot = JSON.parse(JSON.stringify(S.content));
  saving = saving.catch(function(){}).then(function(){
    return api('PUT', 'api/content', {content: snapshot}).then(function(j){ S.content = j.content; renderPortfolio(); renderClients(); toast(okMsg || 'Tersimpan. Website diperbarui dalam beberapa detik.'); })
      .catch(function(e){ if (!onAuthError(e)) { toast('Gagal menyimpan: ' + e.message, true); loadContent(); } throw e; });
  });
  return saving;
}
function move(arr, i, d){ var j = i + d; if (j < 0 || j >= arr.length) return false; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; return true; }

/* ---------- gambar ---------- */
function readImage(file){
  if (window.createImageBitmap) return createImageBitmap(file, {imageOrientation:'from-image'}).catch(function(){ return createImageBitmap(file); });
  return new Promise(function(res, rej){ var img = new Image(); img.onload = function(){ res(img); }; img.onerror = function(){ rej(new Error('Foto tidak bisa dibaca.')); }; img.src = URL.createObjectURL(file); });
}
function toDataUrl(src, maxW, maxH, quality){
  var w = src.width, h = src.height, s = Math.min(1, maxW / w, maxH / h);
  var cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * s)); cv.height = Math.max(1, Math.round(h * s));
  cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
  var d = cv.toDataURL('image/webp', quality);
  if (d.indexOf('data:image/webp') !== 0) d = cv.toDataURL('image/jpeg', quality);
  return d;
}
function compress(src, maxW, maxH){
  var q = 0.82, d = toDataUrl(src, maxW, maxH, q);
  while (d.length * 0.75 > 850 * 1024 && q > 0.45) { q -= 0.1; d = toDataUrl(src, maxW, maxH, q); }
  return d;
}
function uploadData(d){ return api('POST', 'api/upload', {data:d}).then(function(j){ return j.src; }); }
function uploadPhoto(file){
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return Promise.reject(new Error(file.name + ': format harus JPG, PNG, atau WebP.'));
  return readImage(file).then(function(img){
    var big = compress(img, 1400, 1400), small = compress(img, 640, 640);
    return Promise.all([uploadData(big), uploadData(small)]).then(function(r){ return {src:r[0], thumb:r[1]}; });
  });
}

/* ---------- portofolio ---------- */
function renderPortfolio(){
  var list = (S.content && S.content.portfolio) || [], box = $('#porto-list');
  if (!list.length) { box.innerHTML = '<div class="empty"><b>Belum ada proyek</b>Klik Tambah proyek untuk menambahkan.</div>'; return; }
  box.innerHTML = list.map(function(p, i){
    var f = (p.photos || [])[0] || {};
    return '<div class="row-item" data-i="' + i + '"><div class="ord"><button class="icon-btn" type="button" data-act="up" aria-label="Naikkan"' + (i === 0 ? ' disabled' : '') + '><svg><use href="#i-up"/></svg></button><button class="icon-btn" type="button" data-act="down" aria-label="Turunkan"' + (i === list.length - 1 ? ' disabled' : '') + '><svg><use href="#i-down"/></svg></button></div>' +
      '<img class="thumb" src="' + esc(f.thumb || f.src || '') + '" alt="" loading="lazy">' +
      '<div><b>' + esc(p.title) + '</b><small>' + esc(CATS[p.cat] || p.cat) + ', ' + (p.photos || []).length + ' foto' + (i === 0 ? ', tampil paling besar' : '') + '</small></div>' +
      '<div class="acts"><button class="icon-btn" type="button" data-act="edit" aria-label="Ubah ' + esc(p.title) + '"><svg><use href="#i-edit"/></svg></button><button class="icon-btn del" type="button" data-act="del" aria-label="Hapus ' + esc(p.title) + '"><svg><use href="#i-del"/></svg></button></div></div>';
  }).join('');
}
$('#porto-list').addEventListener('click', function(e){
  var b = e.target.closest('[data-act]'); if (!b) return;
  var i = +b.closest('.row-item').getAttribute('data-i'), list = S.content.portfolio, act = b.getAttribute('data-act');
  if (act === 'up' || act === 'down') { if (move(list, i, act === 'up' ? -1 : 1)) { renderPortfolio(); persist('Urutan portofolio disimpan'); } }
  else if (act === 'edit') openEditor(i);
  else if (act === 'del') confirmBox('Hapus "' + list[i].title + '"?', 'Proyek dan fotonya akan hilang dari website.').then(function(ok){ if (ok) { list.splice(i, 1); renderPortfolio(); persist('Proyek dihapus'); } });
});
var ED = null;
function openEditor(i){
  var p = i == null ? {id:'', title:'', cat:'jalan', photos:[]} : JSON.parse(JSON.stringify(S.content.portfolio[i]));
  ED = {i:i, p:p, uploading:0};
  $('#ed-title').textContent = i == null ? 'Tambah proyek' : 'Ubah proyek';
  $('#ed-name').value = p.title;
  $('#ed-cat').innerHTML = Object.keys(CATS).map(function(k){ return '<option value="' + k + '"' + (k === p.cat ? ' selected' : '') + '>' + CATS[k] + '</option>'; }).join('');
  $('#ed-err').textContent = '';
  renderPhotos(); showModal($('#editor'));
}
function renderPhotos(){
  var ph = ED.p.photos;
  $('#ed-count').textContent = ph.length + ' foto' + (ED.uploading ? ', ' + ED.uploading + ' sedang diunggah' : '');
  $('#ed-photos').innerHTML = ph.map(function(f, i){
    return '<div class="ph" data-i="' + i + '"><img src="' + esc(f.thumb || f.src) + '" alt="">' + (i === 0 ? '<span class="first">Sampul</span>' : '') +
      '<div class="tools"><button class="icon-btn" type="button" data-act="l" aria-label="Geser ke kiri"' + (i === 0 ? ' disabled' : '') + '><svg><use href="#i-left"/></svg></button><button class="icon-btn" type="button" data-act="r" aria-label="Geser ke kanan"' + (i === ph.length - 1 ? ' disabled' : '') + '><svg><use href="#i-right"/></svg></button><button class="icon-btn del" type="button" data-act="x" aria-label="Hapus foto"><svg><use href="#i-del"/></svg></button></div></div>';
  }).join('') + Array(ED.uploading + 1).join('<div class="ph loading">Mengunggah…</div>');
}
$('#ed-photos').addEventListener('click', function(e){
  var b = e.target.closest('[data-act]'); if (!b) return;
  var i = +b.closest('.ph').getAttribute('data-i'), a = b.getAttribute('data-act');
  if (a === 'x') ED.p.photos.splice(i, 1); else move(ED.p.photos, i, a === 'l' ? -1 : 1);
  renderPhotos();
});
function addFiles(files){
  files = Array.prototype.slice.call(files || []);
  if (!files.length) return;
  if (!S.me.storage) { $('#ed-err').textContent = 'Foto belum bisa diunggah: penyimpanan belum terhubung di Vercel.'; return; }
  $('#ed-err').textContent = '';
  files.forEach(function(file){
    ED.uploading++; renderPhotos();
    var ed = ED;
    uploadPhoto(file).then(function(f){ ed.p.photos.push(f); })
      .catch(function(err){ if (!onAuthError(err)) $('#ed-err').textContent = err.message; })
      .then(function(){ ed.uploading--; if (ED === ed) renderPhotos(); });
  });
}
$('#ed-files').addEventListener('change', function(){ addFiles(this.files); this.value = ''; });
var drop = $('.drop');
['dragenter','dragover'].forEach(function(t){ drop.addEventListener(t, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
['dragleave','drop'].forEach(function(t){ drop.addEventListener(t, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
drop.addEventListener('drop', function(e){ addFiles(e.dataTransfer.files); });
$('#ed-save').addEventListener('click', function(){
  var err = $('#ed-err'), btn = this;
  ED.p.title = $('#ed-name').value.trim(); ED.p.cat = $('#ed-cat').value;
  if (!ED.p.title) { err.textContent = 'Isi nama pekerjaan.'; $('#ed-name').focus(); return; }
  if (ED.uploading) { err.textContent = 'Tunggu sampai semua foto selesai diunggah.'; return; }
  if (!ED.p.photos.length) { err.textContent = 'Tambahkan minimal satu foto.'; return; }
  var list = S.content.portfolio;
  if (ED.i == null) { ED.p.id = slug(ED.p.title) + '-' + uid().slice(0, 4); list.unshift(ED.p); }
  else list[ED.i] = ED.p;
  busy(btn, true);
  persist(ED.i == null ? 'Proyek ditambahkan di urutan pertama' : 'Proyek disimpan').then(function(){ hideModal($('#editor')); }).catch(function(){}).then(function(){ busy(btn, false); });
});
$('#porto-add').addEventListener('click', function(){ openEditor(null); });

/* ---------- klien ---------- */
function renderClients(){
  var list = (S.content && S.content.clients) || [], box = $('#client-list');
  if (!list.length) { box.innerHTML = '<div class="empty"><b>Belum ada klien</b>Tambahkan lewat form di atas.</div>'; return; }
  box.innerHTML = list.map(function(c, i){
    return '<div class="row-item" data-i="' + i + '"><div class="ord"><button class="icon-btn" type="button" data-act="up" aria-label="Naikkan"' + (i === 0 ? ' disabled' : '') + '><svg><use href="#i-up"/></svg></button><button class="icon-btn" type="button" data-act="down" aria-label="Turunkan"' + (i === list.length - 1 ? ' disabled' : '') + '><svg><use href="#i-down"/></svg></button></div>' +
      (c.logo ? '<img class="thumb logo" src="' + esc(c.logo) + '" alt="">' : '<span class="thumb txt">Tanpa logo</span>') +
      '<div><b>' + esc(c.name || 'Tanpa nama') + '</b><small>' + (c.logo ? 'Tampil sebagai logo' : 'Tampil sebagai nama') + '</small></div>' +
      '<div class="acts"><button class="icon-btn del" type="button" data-act="del" aria-label="Hapus ' + esc(c.name || 'klien') + '"><svg><use href="#i-del"/></svg></button></div></div>';
  }).join('');
}
$('#client-list').addEventListener('click', function(e){
  var b = e.target.closest('[data-act]'); if (!b) return;
  var i = +b.closest('.row-item').getAttribute('data-i'), list = S.content.clients, act = b.getAttribute('data-act');
  if (act === 'up' || act === 'down') { if (move(list, i, act === 'up' ? -1 : 1)) { renderClients(); persist('Urutan klien disimpan'); } }
  else if (act === 'del') confirmBox('Hapus klien ' + (list[i].name || 'ini') + '?', 'Klien akan hilang dari daftar di website.').then(function(ok){ if (ok) { list.splice(i, 1); renderClients(); persist('Klien dihapus'); } });
});
$('#client-form').addEventListener('submit', function(e){
  e.preventDefault();
  var name = $('#c-name').value.trim(), file = $('#c-logo').files[0], btn = $('#c-add');
  if (!name && !file) { toast('Isi nama klien atau pilih logo.', true); return; }
  if (!S.me.storage) { toast('Belum tersimpan: penyimpanan belum terhubung di Vercel.', true); return; }
  busy(btn, true);
  var p = file ? readImage(file).then(function(img){ return uploadData(compress(img, 440, 220)); }) : Promise.resolve('');
  p.then(function(logo){ S.content.clients.push({id: slug(name || 'klien') + '-' + uid().slice(0, 4), name: name, logo: logo}); renderClients(); return persist('Klien ditambahkan'); })
    .then(function(){ $('#client-form').reset(); })
    .catch(function(err){ if (err && err.message !== 'no_storage' && !onAuthError(err)) toast(err.message, true); })
    .then(function(){ busy(btn, false); });
});

/* ---------- kontak ---------- */
var KF = ['person','phone','wa','email','address','maps'];
function fillContact(){ var c = (S.content && S.content.contact) || {}; KF.forEach(function(k){ $('#k-' + k).value = c[k] || ''; }); }
$('#contact-form').addEventListener('submit', function(e){
  e.preventDefault();
  var c = {}; KF.forEach(function(k){ c[k] = $('#k-' + k).value.trim(); });
  c.wa = c.wa.replace(/\D/g, '');
  if (c.wa && !/^\d{9,15}$/.test(c.wa)) { toast('Nomor WhatsApp harus 9 sampai 15 digit, diawali 62.', true); $('#k-wa').focus(); return; }
  if (c.maps && !/^https:\/\//.test(c.maps)) { toast('Link Google Maps harus diawali https://', true); $('#k-maps').focus(); return; }
  var btn = $('#k-save'); busy(btn, true);
  var prev = S.content.contact; S.content.contact = c;
  persist('Kontak disimpan').catch(function(){ S.content.contact = prev; fillContact(); }).then(function(){ busy(btn, false); });
});

boot();
})();
