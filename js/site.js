/* Website CV. Empat Lima Tujuh: skrip bersama semua halaman publik.
   Konten (kontak, portofolio, klien) diambil dari /api/content (diatur lewat halaman admin).
   Bila server belum siap, dipakai data/content.json sebagai cadangan. */
(function(){
'use strict';
var PAGE = document.body.getAttribute('data-page') || '';
var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

var CATS = {
  jalan: {t:'Jalan & fasilitas jalan', d:'Pemasangan dan perawatan perlengkapan jalan, dari rambu dan reflektor sampai guardrail, MCB (median concrete barrier), dan perkerasan beton.', img:'img/p-guardrail-1.webp', pos:'50% 50%'},
  air:   {t:'Drainase & penanganan tanah', d:'Saluran U-ditch, drainase beton, penutup saluran, bronjong, pembersihan saluran, dan penanganan longsor.', img:'img/p-penanganan-longsor-1.webp', pos:'50% 45%'},
  fo:    {t:'Jaringan fiber optik', d:'Penggalian jalur, penarikan kabel, dan instalasi fiber optik, termasuk pengukuran dengan OTDR.', img:'img/p-instalasi-fo-1.webp', pos:'50% 45%'},
  mep:   {t:'Mekanikal, elektrikal & plumbing', d:'Panel dan jaringan listrik, penerangan jalan, genset, serta penyambungan pipa HDPE.', img:'img/hero-pju.webp', pos:'60% 30%'}
};
var DOCS = [
  {id:'akta', t:'Akta pendirian', d:'Notaris Mochammad Lukman, S.H., M.Kn.', n:2},
  {id:'nib',  t:'NIB', d:'Nomor Induk Berusaha', n:6},
  {id:'sbu',  t:'SBU', d:'Sertifikat Badan Usaha jasa konstruksi', n:1},
  {id:'skt',  t:'SKT', d:'Surat Keterangan Terdaftar, Kementerian Hukum dan HAM', n:1},
  {id:'npwp', t:'NPWP', d:'Nomor Pokok Wajib Pajak badan', n:1}
];
var C = null;

var $ = function(s, r){return (r||document).querySelector(s);};
var $$ = function(s, r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function esc(s){return String(s == null ? '' : s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function safeSrc(s){ return /^(img\/[A-Za-z0-9._-]+|api\/img\?id=[A-Za-z0-9_-]+)$/.test(s || '') ? s : ''; }
var AR = '<svg class="ar"><use href="#ar"/></svg>';

/* ---------- konten ---------- */
function getJSON(url, ms){
  var ctl = 'AbortController' in window ? new AbortController() : null;
  var t = ctl ? setTimeout(function(){ ctl.abort(); }, ms) : 0;
  return fetch(url, {signal: ctl ? ctl.signal : undefined, credentials:'same-origin'}).then(function(r){
    clearTimeout(t);
    if (!r.ok || !/json/.test(r.headers.get('content-type') || '')) throw new Error('bad');
    return r.json();
  });
}
function loadContent(){
  return getJSON('api/content', 3000).then(function(j){ return j && j.content; }).catch(function(){ return null; })
    .then(function(c){ return c || getJSON('data/content.json', 10000); })
    .catch(function(){ return {contact:{}, portfolio:[], clients:[]}; });
}
function bindContact(){
  var ct = C.contact || {};
  $$('[data-bind]').forEach(function(el){ var k = el.getAttribute('data-bind'); if (ct[k]) el.textContent = ct[k]; });
  $$('[data-link="wa"]').forEach(function(a){ if (ct.wa) a.href = 'https://wa.me/' + ct.wa; });
  $$('[data-link="mail"]').forEach(function(a){ if (ct.email) a.href = 'mailto:' + ct.email; });
  $$('[data-link="maps"]').forEach(function(a){ if (/^https:\/\//.test(ct.maps || '')) a.href = ct.maps; });
}
function byCat(k){ return (C.portfolio || []).filter(function(p){ return p.cat === k; }); }

/* ---------- layanan: kartu beranda + akordeon ---------- */
function renderServiceCounts(){
  $$('[data-count-cat]').forEach(function(el){ var n = byCat(el.getAttribute('data-count-cat')).length; el.textContent = n + ' jenis pekerjaan'; });
}
function renderAccordion(){
  var svc = $('#svc'); if (!svc) return;
  var open = (location.hash || '').replace('#svc-', '').replace('#', '');
  if (!CATS[open] && open !== 'supply') open = 'jalan';
  var html = Object.keys(CATS).map(function(k){
    var c = CATS[k], items = byCat(k);
    var tags = items.map(function(p){return '<span class="tag">'+esc(p.title.replace(/^Pek\. /,''))+'</span>';}).join('');
    return '<div class="acc-item'+(k===open?' open':'')+'" id="svc-'+k+'">'+
      '<button class="acc-head" type="button" aria-expanded="'+(k===open)+'" aria-controls="svc-b-'+k+'"><span class="acc-title">'+esc(c.t)+'</span><span class="acc-meta">'+items.length+' jenis pekerjaan</span><span class="acc-ico"><svg><use href="#plus"/></svg></span></button>'+
      '<div class="acc-body" id="svc-b-'+k+'"><div class="acc-inner"><div class="acc-media"><img src="'+c.img+'" alt="" loading="lazy" style="object-position:'+c.pos+'">'+
      '<div class="acc-over"><p>'+esc(c.d)+'</p><div class="tags">'+tags+'</div><a class="btn btn-white" href="portofolio#'+k+'">Lihat proyek ('+items.length+') '+AR+'</a></div></div></div></div></div>';
  });
  html.push('<div class="acc-item'+(open==='supply'?' open':'')+'" id="svc-supply"><button class="acc-head" type="button" aria-expanded="'+(open==='supply')+'" aria-controls="svc-b-supply"><span class="acc-title">Supplier</span><span class="acc-meta">Pengadaan barang</span><span class="acc-ico"><svg><use href="#plus"/></svg></span></button>'+
    '<div class="acc-body" id="svc-b-supply"><div class="acc-inner"><div class="acc-media plain"><div class="acc-over"><p>Pengadaan barang dan material pendukung untuk kebutuhan proyek klien.</p><div class="tags"><span class="tag">Material konstruksi</span><span class="tag">Perlengkapan jalan</span><span class="tag">Material elektrikal dan plumbing</span></div><a class="btn btn-white" href="kontak">Tanya ketersediaan '+AR+'</a></div></div></div></div></div>');
  svc.innerHTML = html.join('');
  svc.addEventListener('click', function(e){
    var h = e.target.closest('.acc-head'); if (!h) return;
    var item = h.parentNode, isOpen = !item.classList.contains('open');
    $$('.acc-item', svc).forEach(function(it){ it.classList.remove('open'); $('.acc-head', it).setAttribute('aria-expanded','false'); });
    if (isOpen) { item.classList.add('open'); h.setAttribute('aria-expanded','true'); }
  });
  if (location.hash && $(location.hash.replace(/[^#\w-]/g,''))) setTimeout(function(){ scrollToEl($(location.hash.replace(/[^#\w-]/g,''))); }, 300);
}

/* ---------- portofolio ---------- */
var grid, filters, pill, current = 'semua';
function tileHTML(p, i){
  var ph = p.photos || [], first = ph[0] || {};
  return '<button class="tile" type="button" data-i="'+i+'" data-cat="'+esc(p.cat)+'" aria-label="'+esc(p.title)+', '+ph.length+' foto">'+
    '<img src="'+esc(safeSrc(first.thumb || first.src))+'" alt="" loading="lazy">'+
    (ph.length>1?'<span class="badge">'+ph.length+' foto</span>':'')+'<span class="go"><svg><use href="#arup"/></svg></span>'+
    '<span class="cap"><b>'+esc(p.title)+'</b><small>'+esc((CATS[p.cat]||{}).t||'')+'</small></span></button>';
}
function renderPortfolio(){
  grid = $('#grid'); if (!grid) return;
  var list = C.portfolio || [];
  var limit = +grid.getAttribute('data-limit') || 0;
  var shown = limit ? list.slice(0, limit) : list;
  if (!shown.length) { grid.outerHTML = '<p class="empty-note" id="grid">Portofolio sedang diperbarui.</p>'; return; }
  grid.innerHTML = shown.map(tileHTML).join('');
  grid.addEventListener('click', function(e){
    var b = e.target.closest('.tile'); if(!b) return;
    var p = list[+b.getAttribute('data-i')];
    var imgs = (p.photos||[]).map(function(f, i){ return {src: safeSrc(f.src), alt: p.title+', foto '+(i+1)+' dari '+p.photos.length}; });
    openLB(p.title, (CATS[p.cat]||{}).t || '', imgs, 0, false, b);
  });
  filters = $('#filters'); pill = $('#pill');
  if (filters) {
    var chips = [['semua','Semua',list.length]].concat(Object.keys(CATS).map(function(k){return [k, CATS[k].t, byCat(k).length];}));
    filters.insertAdjacentHTML('beforeend', chips.map(function(c){return '<button class="chip" type="button" data-f="'+c[0]+'" aria-pressed="false">'+esc(c[1])+' <span class="n">'+c[2]+'</span></button>';}).join(''));
    filters.addEventListener('click', function(e){ var b=e.target.closest('.chip'); if(b) setFilter(b.getAttribute('data-f'), true); });
    var h = (location.hash || '').slice(1);
    current = CATS[h] ? h : 'semua';
    $$('.chip', filters).forEach(function(c){ c.setAttribute('aria-pressed', String(c.getAttribute('data-f')===current)); });
    addEventListener('resize', function(){ movePill(false); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ movePill(false); });
    addEventListener('hashchange', function(){ var k = location.hash.slice(1); if (CATS[k] || k === 'semua') setFilter(k, false); });
  }
  applyFilter(current); movePill(false);
}
function movePill(anim){
  if (!filters) return;
  var b = $('.chip[aria-pressed="true"]', filters); if (!b) return;
  if (anim === false) pill.style.transition = 'none';
  pill.style.width = b.offsetWidth + 'px'; pill.style.transform = 'translateX(' + b.offsetLeft + 'px)';
  if (anim === false) { void pill.offsetWidth; pill.style.transition = ''; }
}
function applyFilter(f){
  var k = 0, first = true;
  $$('.tile', grid).forEach(function(t){
    var show = f==='semua' || t.getAttribute('data-cat')===f;
    t.classList.toggle('hide', !show); t.classList.remove('big');
    if (show) { t.style.setProperty('--k', k++); if (first) { t.classList.add('big'); first = false; } }
  });
}
function setFilter(f, push){
  current = f;
  $$('.chip', filters).forEach(function(c){c.setAttribute('aria-pressed', String(c.getAttribute('data-f')===f));});
  movePill(true);
  if (push) { try { history.replaceState(null, '', f === 'semua' ? location.pathname : '#' + f); } catch(e){} }
  var b = $('.chip[aria-pressed="true"]', filters); if (b && filters.scrollWidth > filters.clientWidth) filters.scrollTo({left: b.offsetLeft - 20, behavior: RM ? 'auto' : 'smooth'});
  if (RM) { applyFilter(f); return; }
  grid.classList.remove('in-anim'); grid.classList.add('out');
  setTimeout(function(){ applyFilter(f); grid.classList.remove('out'); void grid.offsetWidth; grid.classList.add('in-anim'); }, 200);
}

/* ---------- legalitas ---------- */
function renderDocs(){
  var d = $('#docs'); if (!d) return;
  d.innerHTML = DOCS.map(function(x, i){
    return '<button class="doc" type="button" data-i="'+i+'" id="doc-'+x.id+'" data-reveal style="--i:'+i+'"><span class="sheet"><img src="img/d-'+x.id+'-1-t.webp" alt="" loading="lazy">'+
      (x.n>1?'<span class="pages">'+x.n+' halaman</span>':'')+'</span><b>'+esc(x.t)+'</b><span>'+esc(x.d)+'</span></button>';
  }).join('');
  d.addEventListener('click', function(e){
    var b = e.target.closest('.doc'); if(!b) return;
    var x = DOCS[+b.getAttribute('data-i')], imgs=[];
    for (var i=1;i<=x.n;i++) imgs.push({src:'img/d-'+x.id+'-'+i+'.webp', alt:x.t+', halaman '+i+' dari '+x.n});
    openLB(x.t, x.d, imgs, 0, true, b);
  });
}

/* ---------- klien ---------- */
function renderClients(){
  var box = $('#clients'); if (!box) return;
  var list = C.clients || [];
  if (!list.length) { box.closest('section').hidden = true; return; }
  function tile(c){ var src = safeSrc(c.logo); return src ? '<div class="client"><img src="'+esc(src)+'" alt="'+esc(c.name || 'Logo klien')+'" loading="lazy"></div>' : '<div class="client text">'+esc(c.name)+'</div>'; }
  function row(items, rev){
    if (!items.length) return '';
    var h = items.map(tile).join('');
    while (items.length && h.split('class="client').length - 1 < 8) h += items.map(tile).join('');
    return '<div class="marquee'+(rev?' rev':'')+'"><div class="mq-track">'+h+'<div style="display:contents" aria-hidden="true">'+h.replace(/alt="[^"]*"/g,'alt=""')+'</div></div></div>';
  }
  var half = Math.ceil(list.length / 2);
  box.innerHTML = list.length > 6 ? row(list.slice(0, half), false) + row(list.slice(half), true) : row(list, false);
  var sc = $('#stat-clients'); if (sc) { sc.setAttribute('data-to', list.length); if (!sc.dataset.pending) sc.textContent = list.length; }
  var sj = $('#stat-jobs'); if (sj) { sj.setAttribute('data-to', (C.portfolio||[]).length); if (!sj.dataset.pending) sj.textContent = (C.portfolio||[]).length; }
}

/* ---------- lightbox & video ---------- */
var lb = $('#lb'), lbState = null, lastFocus = null;
function openLayer(el, opener){ lastFocus = opener || document.activeElement; el.classList.add('open'); el.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeLayer(el){ el.classList.remove('open'); el.setAttribute('aria-hidden','true'); if (!$('.layer.open')) document.body.style.overflow=''; if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true}); }
function openLB(title, sub, imgs, idx, isDoc, opener){
  if (!lb || !imgs.length) return;
  lbState = {imgs:imgs, idx:idx||0, sub:sub};
  $('#lb-title').textContent = title;
  lb.classList.toggle('doc-mode', !!isDoc);
  $('#lb-dots').innerHTML = imgs.length>1 ? imgs.map(function(_, i){return '<button type="button" data-i="'+i+'" aria-label="Ke gambar '+(i+1)+'"></button>';}).join('') : '';
  openLayer(lb, opener); showLB(); $('#lb-x').focus({preventScroll:true});
}
function showLB(){
  var s = lbState, im = s.imgs[s.idx], img = $('#lb-img');
  img.classList.remove('shown');
  var pre = new Image(); pre.onload = pre.onerror = function(){ img.src = im.src; img.alt = im.alt; requestAnimationFrame(function(){ img.classList.add('shown'); }); }; pre.src = im.src;
  $('#lb-sub').textContent = s.sub + (s.imgs.length>1 ? '  ('+(s.idx+1)+' dari '+s.imgs.length+')' : '');
  $('#lb-prev').hidden = $('#lb-next').hidden = s.imgs.length<2;
  $$('#lb-dots button').forEach(function(b, i){b.setAttribute('aria-current', String(i===s.idx));});
}
function stepLB(d){ if(!lbState) return; var n=lbState.imgs.length; lbState.idx=(lbState.idx+d+n)%n; showLB(); }
function closeLB(){ if(!lbState) return; lbState=null; closeLayer(lb); }
if (lb) {
  $('#lb-x').addEventListener('click', closeLB);
  $('#lb-prev').addEventListener('click', function(){stepLB(-1);});
  $('#lb-next').addEventListener('click', function(){stepLB(1);});
  $('#lb-dots').addEventListener('click', function(e){var b=e.target.closest('button'); if(b){lbState.idx=+b.getAttribute('data-i'); showLB();}});
  lb.addEventListener('click', function(e){ if(e.target.classList.contains('lb-stage')) closeLB(); });
}
var vm = $('#vm'), vmv = $('#vm-video');
function openVideo(opener){ if (!vm) return; openLayer(vm, opener); try { vmv.muted = false; vmv.currentTime = 0; var p = vmv.play(); if (p && p.catch) p.catch(function(){ vmv.muted = true; vmv.play().catch(function(){}); }); } catch(err){} $('#vm-x').focus({preventScroll:true}); }
function closeVideo(){ if (!vm || !vm.classList.contains('open')) return; try { vmv.pause(); } catch(err){} closeLayer(vm); }
if (vm) {
  $$('#play-hero, #reel-play').forEach(function(b){ b.addEventListener('click', function(){ openVideo(b); }); });
  $('#vm-x').addEventListener('click', closeVideo);
  vm.addEventListener('click', function(e){ if (e.target.classList.contains('vm-stage')) closeVideo(); });
}
document.addEventListener('keydown', function(e){
  var layer = $('.layer.open'); if (!layer) return;
  if (e.key==='Escape') { layer===lb ? closeLB() : closeVideo(); }
  else if (layer===lb && e.key==='ArrowRight') stepLB(1); else if (layer===lb && e.key==='ArrowLeft') stepLB(-1);
  else if (e.key==='Tab'){ var f=$$('button:not([hidden]),video[controls]', layer); var i=f.indexOf(document.activeElement); if(e.shiftKey && i<=0){e.preventDefault(); f[f.length-1].focus();} else if(!e.shiftKey && i===f.length-1){e.preventDefault(); f[0].focus();} }
});

/* video latar beranda + kartu video */
var hv = $('#hero-video');
if (hv && !RM) {
  var SCENES = [['Elektrikal jalan',3.1],['Guardrail',2.7],['Saluran U-ditch',2.7],['Perkerasan beton',2.7],['Pengecatan guardrail',2.7],['Drainase beton',3.2]];
  hv.addEventListener('canplay', function(){ hv.classList.add('ready'); }, {once:true});
  var hp = hv.play(); if (hp && hp.catch) hp.catch(function(){});
  var lastScene = -1;
  hv.addEventListener('timeupdate', function(){
    var t = hv.currentTime, acc = 0, idx = 0;
    for (var i=0;i<SCENES.length;i++){ if (t >= acc) idx = i; acc += SCENES[i][1]; }
    if (idx !== lastScene) {
      lastScene = idx; $('#scene-name').textContent = SCENES[idx][0];
      $$('#scenes i').forEach(function(b, i){ b.classList.toggle('on', i===idx); if (i===idx) b.style.setProperty('--d', SCENES[idx][1]+'s'); });
    }
  });
}
var rv = $('#reel-video');
if (rv && 'IntersectionObserver' in window) {
  new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting && !RM) { rv.preload='auto'; var p = rv.play(); if (p && p.catch) p.catch(function(){}); } else { try { rv.pause(); } catch(err){} } }); }, {threshold:.25}).observe($('#reel-card'));
}

/* ---------- form permintaan penawaran ---------- */
function initForm(){
  var form = $('#quote'); if (!form) return;
  var jenis = $('#q-jenis');
  Object.keys(CATS).forEach(function(k){ var o=document.createElement('option'); o.value=CATS[k].t; o.textContent=CATS[k].t; jenis.appendChild(o); });
  ['Pengadaan barang (supplier)','Lainnya'].forEach(function(t){ var o=document.createElement('option'); o.value=t; o.textContent=t; jenis.appendChild(o); });
  var pre = (location.hash || '').slice(1); if (CATS[pre]) jenis.value = CATS[pre].t;
  var btn = $('#q-submit'), note = $('#form-note'), lastMsg = '';
  var v = function(id){ return $('#'+id).value.trim(); };
  function fieldErr(name, msg){ var f = $('#q-'+name).closest('.field'); f.classList.add('invalid'); if (msg) $('#err-'+name).textContent = msg; }
  function buildMsg(code){
    var lines = ['Halo CV. Empat Lima Tujuh,', '', 'Saya '+v('q-nama')+(v('q-org')?' dari '+v('q-org'):'')+'. Saya ingin meminta penawaran untuk pekerjaan berikut:', '',
      'Jenis pekerjaan: '+v('q-jenis'), 'Lokasi proyek: '+(v('q-lokasi')||'-'), 'Rencana mulai: '+(v('q-mulai')||'Belum ditentukan')];
    if (v('q-detail')) lines.push('Rincian: '+v('q-detail'));
    lines.push('', 'Nomor WhatsApp saya: '+v('q-hp'));
    if (code) lines.push('Kode permintaan: '+code);
    lines.push('Terima kasih.');
    return lines.join('\n');
  }
  function fallback(reason){
    var ct = C.contact || {};
    lastMsg = buildMsg('');
    $('#msg').textContent = lastMsg;
    $('#send-wa').href = 'https://wa.me/'+(ct.wa||'6285879582495')+'?text='+encodeURIComponent(lastMsg);
    $('#send-mail').href = 'mailto:'+(ct.email||'cvempatlimatujuh@gmail.com')+'?subject='+encodeURIComponent('Permintaan penawaran: '+v('q-jenis'))+'&body='+encodeURIComponent(lastMsg);
    note.textContent = reason + ' Pesan Anda sudah kami susun di bawah, silakan kirim lewat WhatsApp atau email.';
    note.classList.add('show');
    $('#summary').classList.add('show');
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    note.classList.remove('show'); $('#summary').classList.remove('show');
    $$('.field.invalid', form).forEach(function(f){ f.classList.remove('invalid'); });
    var bad = [];
    if (v('q-nama').length < 2) bad.push('nama');
    var digits = v('q-hp').replace(/\D/g,'');
    if (digits.length < 8 || digits.length > 15) bad.push('hp');
    if (!v('q-jenis')) bad.push('jenis');
    if (bad.length) { bad.forEach(function(b){ fieldErr(b); }); $('#q-'+bad[0]).focus(); return; }
    btn.disabled = true; btn.classList.add('loading');
    var payload = {nama:v('q-nama'), org:v('q-org'), hp:v('q-hp'), jenis:v('q-jenis'), lokasi:v('q-lokasi'), mulai:v('q-mulai'), detail:v('q-detail'), website:$('#q-website').value};
    var ctl = 'AbortController' in window ? new AbortController() : null, tm = ctl ? setTimeout(function(){ ctl.abort(); }, 12000) : 0;
    fetch('api/lead', {method:'POST', headers:{'Content-Type':'application/json','X-Requested-With':'457'}, body:JSON.stringify(payload), signal: ctl ? ctl.signal : undefined})
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return {status:r.status, ok:r.ok, j:j, json:/json/.test(r.headers.get('content-type')||'')}; }); })
      .then(function(res){
        clearTimeout(tm);
        if (res.ok && res.j.ok) {
          var ct = C.contact || {};
          $('#sent-text').textContent = 'Terima kasih, ' + v('q-nama') + '. Admin kami akan menghubungi Anda lewat WhatsApp di nomor ' + v('q-hp') + '.';
          $('#sent-code').textContent = 'Kode permintaan: ' + res.j.code;
          $('#sent-wa').href = 'https://wa.me/'+(ct.wa||'6285879582495')+'?text='+encodeURIComponent(buildMsg(res.j.code));
          form.classList.add('done'); $('#sent').classList.add('show');
          scrollToEl(form, 600);
          return;
        }
        var map = {bad_nama:'nama', bad_hp:'hp', bad_jenis:'jenis'};
        if (res.status === 400 && map[res.j.error]) { fieldErr(map[res.j.error], res.j.message); $('#q-'+map[res.j.error]).focus(); return; }
        if (res.status === 429) { note.textContent = res.j.message || 'Terlalu banyak pengiriman. Coba lagi beberapa menit lagi.'; note.classList.add('show'); return; }
        fallback(res.json ? 'Server belum bisa menyimpan permintaan saat ini.' : 'Form online hanya tersedia di website utama.');
      })
      .catch(function(){ clearTimeout(tm); fallback('Koneksi ke server terputus.'); })
      .then(function(){ btn.disabled = false; btn.classList.remove('loading'); });
  });
  $$('input, select, textarea', form).forEach(function(f){ f.addEventListener('input', function(){ var fl = f.closest('.field'); if (fl) fl.classList.remove('invalid'); }); });
  $('#sent-again').addEventListener('click', function(){ form.reset(); form.classList.remove('done'); $('#sent').classList.remove('show'); $('#q-nama').focus(); });
  $('#copy-msg').addEventListener('click', function(){
    var s = $('#send-status');
    try { navigator.clipboard.writeText(lastMsg).then(function(){ s.textContent='Pesan disalin. Tempel di WhatsApp atau email Anda.'; }, function(){ s.textContent='Tidak bisa menyalin otomatis. Pilih teks pesan di atas lalu salin manual.'; }); }
    catch(err){ s.textContent='Tidak bisa menyalin otomatis. Pilih teks pesan di atas lalu salin manual.'; }
  });
}

/* ---------- header, menu, progres ---------- */
var topbar = $('#top'), drawer = $('#drawer'), menuBtn = $('#menu-btn'), prog = $('#progress');
function setDrawer(o){ drawer.classList.toggle('open', o); drawer.setAttribute('aria-hidden', String(!o)); menuBtn.setAttribute('aria-expanded', String(o)); if (o) $('#drawer-x').focus({preventScroll:true}); }
menuBtn.addEventListener('click', function(){ setDrawer(true); });
$('#drawer-x').addEventListener('click', function(){ setDrawer(false); menuBtn.focus({preventScroll:true}); });
drawer.addEventListener('click', function(e){ if (e.target.closest('a')) setDrawer(false); });
var heroEl = $('.hero, .page-hero');
function onScroll(){
  var y = scrollY;
  topbar.classList.toggle('solid', !heroEl || y > heroEl.offsetHeight - 90);
  var max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  reel();
}
var reelSec = $('#video'), reelCard = $('#reel-card');
function reel(){
  if (!reelSec) return;
  if (RM || innerWidth <= 860) { reelCard.style.transform=''; reelCard.style.borderRadius=''; return; }
  var r = reelSec.getBoundingClientRect(), travel = r.height - innerHeight;
  var p = Math.min(1, Math.max(0, (-r.top + innerHeight*0.15) / (travel*0.75)));
  var e = 1 - Math.pow(1-p, 2);
  reelCard.style.transform = 'scale(' + (0.84 + 0.16*e).toFixed(4) + ')';
  reelCard.style.borderRadius = (28*(1-e)).toFixed(1) + 'px';
}
addEventListener('scroll', onScroll, {passive:true}); addEventListener('resize', onScroll); onScroll();

function scrollToEl(target, dur){
  var off = $('.bar', topbar).offsetHeight - 2;
  var y = Math.max(0, target.getBoundingClientRect().top + scrollY - off);
  y = Math.min(y, document.documentElement.scrollHeight - innerHeight);
  var start = scrollY, dist = y - start;
  dur = dur || Math.min(1500, 500 + Math.abs(dist)*0.3);
  if (RM || Math.abs(dist) < 2) { scrollTo(0, y); return; }
  var t0 = performance.now();
  (function f(now){ var t=Math.min(1,(now-t0)/dur), e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; scrollTo(0, start+dist*e); if(t<1) requestAnimationFrame(f); })(t0);
}
document.addEventListener('click', function(e){
  var a = e.target.closest('a[href^="#"]'); if(!a) return;
  var id = a.getAttribute('href').slice(1), t = id && document.getElementById(id); if(!t) return;
  e.preventDefault(); scrollToEl(t);
});

/* ---------- reveal + hitung naik ---------- */
var io = null;
function countUp(el){
  var to = +el.getAttribute('data-to'), t0 = performance.now(), d = 1400;
  (function f(now){ var t=Math.min(1,(now-t0)/d), e=1-Math.pow(1-t,3); el.textContent = Math.round(to*e); if (t<1) requestAnimationFrame(f); })(t0);
}
function observeReveals(){
  if (RM || !('IntersectionObserver' in window)) return;
  if (!io) io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); var c = $('.count', e.target); if (c && c.dataset.pending) { delete c.dataset.pending; countUp(c); } io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -6% 0px', threshold:.06});
  $$('[data-reveal]:not([data-seen])').forEach(function(el){
    el.setAttribute('data-seen', '1');
    var r = el.getBoundingClientRect();
    if (r.top < innerHeight * .94 && r.bottom > 0) { el.classList.add('in'); }
    else { var c = $('.count', el); if (c) { c.dataset.pending = 1; c.textContent = '0'; } io.observe(el); }
  });
}
if (!RM && 'IntersectionObserver' in window) { document.documentElement.classList.add('motion'); document.body.classList.add('intro-anim'); }
observeReveals();
renderDocs();
initForm();
observeReveals();

loadContent().then(function(c){
  C = c || {contact:{}, portfolio:[], clients:[]};
  bindContact();
  renderServiceCounts();
  renderAccordion();
  renderPortfolio();
  renderClients();
  observeReveals();
});
})();
