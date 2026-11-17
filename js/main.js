(function(){
'use strict';
/* ===== PENGATURAN =====
   TAMPILKAN_TOMBOL_SIMULASI: tampilkan tombol "Buka simulasi website" di pojok kiri bawah.
   Ubah ke false bila website sudah dipakai untuk umum. */
var TAMPILKAN_TOMBOL_SIMULASI = true;
if (location.hash === '#simulasi') { location.replace('simulasi.html'); return; }
var EMBED = location.hash === '#embed' || /[?&]embed=1/.test(location.search);
if (!TAMPILKAN_TOMBOL_SIMULASI) { var sp = document.getElementById('sim-pill'); if (sp) sp.style.display = 'none'; }
var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
var WA = '6285879582495', MAIL = 'cvempatlimatujuh@gmail.com';

var CATS = {
  jalan: {t:'Jalan & fasilitas jalan', d:'Pemasangan dan perawatan perlengkapan jalan, dari rambu dan reflektor sampai guardrail, MCB (median concrete barrier), dan perkerasan beton.', img:'p-guardrail-1', pos:'50% 50%'},
  air:   {t:'Drainase & penanganan tanah', d:'Saluran U-ditch, drainase beton, penutup saluran, bronjong, pembersihan saluran, dan penanganan longsor.', img:'p-penanganan-longsor-1', pos:'50% 45%'},
  fo:    {t:'Jaringan fiber optik', d:'Penggalian jalur, penarikan kabel, dan instalasi fiber optik, termasuk pengukuran dengan OTDR.', img:'p-instalasi-fo-1', pos:'50% 45%'},
  mep:   {t:'Mekanikal, elektrikal & plumbing', d:'Panel dan jaringan listrik, penerangan jalan, genset, serta penyambungan pipa HDPE.', img:'hero-pju', pos:'60% 30%'}
};
var P = [
  ['mekanikal-elektrikal','Pek. Mekanikal Elektrikal','mep',3],
  ['elektrikal','Pek. Elektrikal','mep',6],
  ['plumbing','Pek. Plumbing','mep',3],
  ['guardrail','Pek. Guardrail','jalan',1],
  ['penanganan-longsor','Penanganan Longsor','air',1],
  ['rambu-informasi','Rambu Informasi','jalan',1],
  ['pemasangan-fo','Pemasangan Fiber Optik','fo',1],
  ['u-ditch','Pek. Saluran U-Ditch','air',1],
  ['reflektor-jalan','Reflektor Jalan','jalan',1],
  ['bronjong','Pek. Bronjong','air',1],
  ['pengecatan-mcb','Pengecatan MCB','jalan',1],
  ['instalasi-fo','Instalasi Fiber Optik','fo',1],
  ['drainase-beton','Pek. Drainase Beton','air',1],
  ['rambu-jalan','Pekerjaan Rambu Jalan','jalan',1],
  ['perkerasan-beton','Pek. Perkerasan Beton','jalan',1],
  ['pembersihan-saluran','Pembersihan Saluran','air',1],
  ['pengecatan-guardrail','Pengecatan Guardrail','jalan',1],
  ['pagar-pembatas','Pek. Pagar Pembatas','jalan',1],
  ['penutup-saluran','Pek. Penutup Saluran','air',1],
  ['pembersihan-mcb','Pembersihan MCB/Beton','jalan',1],
  ['rambu-fasilitas','Pek. Rambu Fasilitas Jalan','jalan',1],
  ['pengecatan-kanstin','Pengecatan Kanstin','jalan',1],
  ['pengecatan-struktur','Pengecatan Struktur','jalan',1],
  ['pemotongan-rumput','Pemotongan Rumput','jalan',1]
].map(function(r){return {id:r[0], t:r[1], cat:r[2], n:r[3]};});
var DOCS = [
  {id:'akta', t:'Akta pendirian', d:'Notaris Mochammad Lukman, S.H., M.Kn.', n:2},
  {id:'nib',  t:'NIB', d:'Nomor Induk Berusaha', n:6},
  {id:'sbu',  t:'SBU', d:'Sertifikat Badan Usaha jasa konstruksi', n:1},
  {id:'skt',  t:'SKT', d:'Surat Keterangan Terdaftar, Kementerian Hukum dan HAM', n:1},
  {id:'npwp', t:'NPWP', d:'Nomor Pokok Wajib Pajak badan', n:1}
];
var CLIENTS = [
  ['img','waskita','Waskita'],['img','nindya','Nindya'],['img','pbtr','Pemalang Batang Tol Road'],['img','industropolis','Industropolis Batang'],
  ['img','indoprima','Indoprima Trans'],['img','nesinak','Nesinak'],['img','bolesca','Bolesca Food'],['img','fondfashion','Fondfashion Seamless Garment'],
  ['img','orlando','Orlando Aristo'],['img','wicaksana','Wicaksana Outdoor Advertising'],['img','rsi','RSI Al-Ikhlas Pemalang'],['img','p-logo','Logo klien'],
  ['txt','','Sanbao Restaurant'],['txt','','PT. Jawa Raya Abadi'],['txt','','PT. Wisco Kayu Indonesia']
];

var $ = function(s, r){return (r||document).querySelector(s);};
var $$ = function(s, r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var AR = '<svg class="ar"><use href="#ar"/></svg>';

/* ---------- layanan: akordeon ---------- */
(function(){
  var html = Object.keys(CATS).map(function(k, idx){
    var c = CATS[k], items = P.filter(function(p){return p.cat===k;});
    var tags = items.map(function(p){return '<span class="tag">'+esc(p.t.replace(/^Pek\. /,''))+'</span>';}).join('');
    return '<div class="acc-item'+(idx===0?' open':'')+'" id="svc-'+k+'">'+
      '<button class="acc-head" type="button" aria-expanded="'+(idx===0)+'" aria-controls="svc-b-'+k+'"><span class="acc-title">'+esc(c.t)+'</span><span class="acc-meta">'+items.length+' jenis pekerjaan</span><span class="acc-ico"><svg><use href="#plus"/></svg></span></button>'+
      '<div class="acc-body" id="svc-b-'+k+'"><div class="acc-inner"><div class="acc-media"><img src="img/'+c.img+'.webp" alt="" loading="lazy" style="object-position:'+c.pos+'">'+
      '<div class="acc-over"><p>'+esc(c.d)+'</p><div class="tags">'+tags+'</div><button class="btn btn-white" type="button" data-cat="'+k+'">Lihat proyek ('+items.length+') '+AR+'</button></div></div></div></div></div>';
  });
  html.push('<div class="acc-item" id="svc-supply"><button class="acc-head" type="button" aria-expanded="false" aria-controls="svc-b-supply"><span class="acc-title">Supplier</span><span class="acc-meta">Pengadaan barang</span><span class="acc-ico"><svg><use href="#plus"/></svg></span></button>'+
    '<div class="acc-body" id="svc-b-supply"><div class="acc-inner"><div class="acc-media plain"><div class="acc-over"><p>Pengadaan barang dan material pendukung untuk kebutuhan proyek klien.</p><div class="tags"><span class="tag">Material konstruksi</span><span class="tag">Perlengkapan jalan</span><span class="tag">Material elektrikal dan plumbing</span></div><a class="btn btn-white" href="#kontak">Tanya ketersediaan '+AR+'</a></div></div></div></div></div>');
  var svc = $('#svc'); svc.innerHTML = html.join('');
  svc.addEventListener('click', function(e){
    var b = e.target.closest('[data-cat]');
    if (b) { setFilter(b.getAttribute('data-cat')); scrollToEl($('#portofolio')); return; }
    var h = e.target.closest('.acc-head'); if (!h) return;
    var item = h.parentNode, open = !item.classList.contains('open');
    $$('.acc-item', svc).forEach(function(it){ it.classList.remove('open'); $('.acc-head', it).setAttribute('aria-expanded','false'); });
    if (open) { item.classList.add('open'); h.setAttribute('aria-expanded','true'); }
  });
  $('#foot-svc').innerHTML = Object.keys(CATS).map(function(k){return '<li><a href="#portofolio" data-foot-cat="'+k+'">'+esc(CATS[k].t)+'</a></li>';}).join('') + '<li><a href="#kontak">Supplier</a></li>';
  $('#foot-svc').addEventListener('click', function(e){ var a = e.target.closest('[data-foot-cat]'); if (a) setFilter(a.getAttribute('data-foot-cat')); });
})();

/* ---------- portofolio ---------- */
var grid = $('#grid'), filters = $('#filters'), pill = $('#pill'), current = 'semua';
(function(){
  var chips = [['semua','Semua',P.length]].concat(Object.keys(CATS).map(function(k){return [k, CATS[k].t, P.filter(function(p){return p.cat===k;}).length];}));
  filters.insertAdjacentHTML('beforeend', chips.map(function(c){return '<button class="chip" type="button" data-f="'+c[0]+'" aria-pressed="'+(c[0]==='semua')+'">'+esc(c[1])+' <span class="n">'+c[2]+'</span></button>';}).join(''));
  filters.addEventListener('click', function(e){var b=e.target.closest('.chip'); if(b) setFilter(b.getAttribute('data-f'));});
  grid.innerHTML = P.map(function(p, i){
    return '<button class="tile" type="button" data-i="'+i+'" data-cat="'+p.cat+'" aria-label="'+esc(p.t)+', '+p.n+' foto">'+
      '<img src="img/p-'+p.id+'-1-t.webp" alt="" loading="lazy">'+
      (p.n>1?'<span class="badge">'+p.n+' foto</span>':'')+'<span class="go"><svg><use href="#arup"/></svg></span>'+
      '<span class="cap"><b>'+esc(p.t)+'</b><small>'+esc(CATS[p.cat].t)+'</small></span></button>';
  }).join('');
  grid.addEventListener('click', function(e){
    var b = e.target.closest('.tile'); if(!b) return;
    var p = P[+b.getAttribute('data-i')], imgs = [];
    for (var i=1;i<=p.n;i++) imgs.push({src:'img/p-'+p.id+'-'+i+'.webp', alt:p.t+', foto '+i+' dari '+p.n});
    openLB(p.t, CATS[p.cat].t, imgs, 0, false, b);
  });
  applyFilter('semua'); movePill(false);
  addEventListener('resize', function(){ movePill(false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ movePill(false); });
})();
function movePill(anim){
  var b = $('.chip[aria-pressed="true"]', filters); if (!b) return;
  if (anim === false) { pill.style.transition = 'none'; }
  pill.style.width = b.offsetWidth + 'px'; pill.style.transform = 'translateX(' + b.offsetLeft + 'px)';
  if (anim === false) { void pill.offsetWidth; pill.style.transition = ''; }
}
function applyFilter(f){
  var k = 0, first = true;
  $$('.tile', grid).forEach(function(t){
    var show = f==='semua' || t.getAttribute('data-cat')===f;
    t.classList.toggle('hide', !show);
    t.classList.remove('big');
    if (show) { t.style.setProperty('--k', k++); if (first) { t.classList.add('big'); first = false; } }
  });
}
function setFilter(f){
  current = f;
  $$('.chip', filters).forEach(function(c){c.setAttribute('aria-pressed', String(c.getAttribute('data-f')===f));});
  movePill(true);
  var b = $('.chip[aria-pressed="true"]', filters); if (b && filters.scrollWidth > filters.clientWidth) filters.scrollTo({left: b.offsetLeft - 20, behavior: RM ? 'auto' : 'smooth'});
  if (RM) { applyFilter(f); return; }
  grid.classList.remove('in-anim'); grid.classList.add('out');
  setTimeout(function(){ applyFilter(f); grid.classList.remove('out'); void grid.offsetWidth; grid.classList.add('in-anim'); }, 200);
}

/* ---------- legalitas ---------- */
(function(){
  var d = $('#docs');
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
})();

/* ---------- klien: dua baris berjalan ---------- */
(function(){
  function tile(c){ return c[0]==='img' ? '<div class="client"><img src="img/c-'+c[1]+'.webp" alt="'+esc(c[2])+'" loading="lazy"></div>' : '<div class="client text">'+esc(c[2])+'</div>'; }
  function row(items, rev){
    var h = items.map(tile).join('');
    return '<div class="marquee'+(rev?' rev':'')+'"><div class="mq-track">'+h+'<div style="display:contents" aria-hidden="true">'+h.replace(/alt="[^"]*"/g,'alt=""')+'</div></div></div>';
  }
  $('#clients').innerHTML = row(CLIENTS.slice(0,8), false) + row(CLIENTS.slice(8), true);
})();

/* ---------- lightbox ---------- */
var lb = $('#lb'), lbState = null, lastFocus = null;
function openLayer(el, opener){ lastFocus = opener || document.activeElement; el.classList.add('open'); el.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeLayer(el){ el.classList.remove('open'); el.setAttribute('aria-hidden','true'); if (!$('.layer.open')) document.body.style.overflow=''; if (lastFocus && !EMBED && lastFocus.focus) lastFocus.focus({preventScroll:true}); }
function openLB(title, sub, imgs, idx, isDoc, opener){
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
$('#lb-x').addEventListener('click', closeLB);
$('#lb-prev').addEventListener('click', function(){stepLB(-1);});
$('#lb-next').addEventListener('click', function(){stepLB(1);});
$('#lb-dots').addEventListener('click', function(e){var b=e.target.closest('button'); if(b){lbState.idx=+b.getAttribute('data-i'); showLB();}});
lb.addEventListener('click', function(e){ if(e.target.classList.contains('lb-stage')) closeLB(); });

/* ---------- video ---------- */
var vm = $('#vm'), vmv = $('#vm-video');
function openVideo(opener){ openLayer(vm, opener); try { vmv.muted = EMBED; vmv.volume = 1; vmv.currentTime = 0; var p = vmv.play(); if (p && p.catch) p.catch(function(){ vmv.muted = true; var p2 = vmv.play(); if (p2 && p2.catch) p2.catch(function(){}); }); } catch(err){} $('#vm-x').focus({preventScroll:true}); }
function closeVideo(){ if (!vm.classList.contains('open')) return; try { vmv.pause(); } catch(err){} closeLayer(vm); }
$('#play-hero').addEventListener('click', function(){ openVideo(this); });
$('#reel-play').addEventListener('click', function(){ openVideo(this); });
$('#vm-x').addEventListener('click', closeVideo);
vm.addEventListener('click', function(e){ if (e.target.classList.contains('vm-stage')) closeVideo(); });
document.addEventListener('keydown', function(e){
  var layer = $('.layer.open'); if (!layer) return;
  if (e.key==='Escape') { layer===lb ? closeLB() : closeVideo(); }
  else if (layer===lb && e.key==='ArrowRight') stepLB(1); else if (layer===lb && e.key==='ArrowLeft') stepLB(-1);
  else if (e.key==='Tab'){ var f=$$('button:not([hidden]),video[controls]', layer); var i=f.indexOf(document.activeElement); if(e.shiftKey && i<=0){e.preventDefault(); f[f.length-1].focus();} else if(!e.shiftKey && i===f.length-1){e.preventDefault(); f[0].focus();} }
});

/* hero video: putar setelah siap, label adegan ikut berganti */
var hv = $('#hero-video');
var SCENES = [['Elektrikal jalan',3.1],['Guardrail',2.7],['Saluran U-ditch',2.7],['Perkerasan beton',2.7],['Pengecatan guardrail',2.7],['Drainase beton',3.2]];
if (!RM) {
  hv.addEventListener('canplay', function(){ hv.classList.add('ready'); }, {once:true});
  var hp = hv.play(); if (hp && hp.catch) hp.catch(function(){});
  var lastScene = -1;
  hv.addEventListener('timeupdate', function(){
    var t = hv.currentTime, acc = 0, idx = 0;
    for (var i=0;i<SCENES.length;i++){ if (t >= acc) idx = i; acc += SCENES[i][1]; }
    if (idx !== lastScene) {
      lastScene = idx; $('#scene-name').textContent = SCENES[idx][0];
      $$('#scenes i').forEach(function(b, i){ b.classList.toggle('on', i===idx); if (i===idx) { b.style.setProperty('--d', SCENES[idx][1]+'s'); } });
    }
  });
}
/* reel: hanya diputar saat terlihat */
var rv = $('#reel-video');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting && !RM) { rv.preload='auto'; var p = rv.play(); if (p && p.catch) p.catch(function(){}); } else { try { rv.pause(); } catch(err){} } }); }, {threshold:.25}).observe($('#reel-card'));
}

/* ---------- form penawaran ---------- */
var form = $('#quote'), jenis = $('#q-jenis');
Object.keys(CATS).forEach(function(k){ var o=document.createElement('option'); o.value=CATS[k].t; o.textContent=CATS[k].t; jenis.appendChild(o); });
['Pengadaan barang (supplier)','Lainnya'].forEach(function(t){ var o=document.createElement('option'); o.value=t; o.textContent=t; jenis.appendChild(o); });
var lastMsg = '';
form.addEventListener('submit', function(e){
  e.preventDefault();
  var ok = true;
  ['q-nama','q-hp','q-jenis'].forEach(function(id){ var f=$('#'+id), bad=!f.value.trim(); f.closest('.field').classList.toggle('invalid', bad); if(bad && ok){ ok=false; if(!EMBED) f.focus(); } });
  if(!ok) return;
  var v = function(id){return $('#'+id).value.trim();};
  var lines = ['Halo CV. Empat Lima Tujuh,', '', 'Saya '+v('q-nama')+(v('q-org')?' dari '+v('q-org'):'')+'. Saya ingin meminta penawaran untuk pekerjaan berikut:', '',
    'Jenis pekerjaan: '+v('q-jenis'), 'Lokasi proyek: '+(v('q-lokasi')||'-'), 'Rencana mulai: '+(v('q-mulai')||'Belum ditentukan')];
  if (v('q-detail')) lines.push('Rincian: '+v('q-detail'));
  lines.push('', 'Nomor WhatsApp saya: '+v('q-hp'), 'Terima kasih.');
  lastMsg = lines.join('\n');
  $('#msg').textContent = lastMsg;
  $('#send-wa').href = 'https://wa.me/'+WA+'?text='+encodeURIComponent(lastMsg);
  $('#send-mail').href = 'mailto:'+MAIL+'?subject='+encodeURIComponent('Permintaan penawaran: '+v('q-jenis'))+'&body='+encodeURIComponent(lastMsg);
  $('#send-status').textContent = '';
  $('#summary').classList.add('show');
  if (EMBED) post({type:'sim-quote', text:lastMsg, nama:v('q-nama')});
});
$$('#quote input, #quote select').forEach(function(f){ f.addEventListener('input', function(){ f.closest('.field').classList.remove('invalid'); }); });
$('#copy-msg').addEventListener('click', function(){
  var s = $('#send-status');
  try { navigator.clipboard.writeText(lastMsg).then(function(){ s.textContent='Pesan disalin. Tempel di WhatsApp atau email Anda.'; }, function(){ s.textContent='Tidak bisa menyalin otomatis. Pilih teks pesan di atas lalu salin manual.'; }); }
  catch(err){ s.textContent='Tidak bisa menyalin otomatis. Pilih teks pesan di atas lalu salin manual.'; }
});
$('#send-mail').addEventListener('click', function(){ $('#send-status').textContent = 'Jika aplikasi email tidak terbuka, kirim pesan di atas ke '+MAIL+'.'; });
$('#send-wa').addEventListener('click', function(e){
  if (EMBED) { e.preventDefault(); post({type:'sim-send', text:lastMsg}); $('#send-status').textContent = 'Simulasi: pesan diteruskan ke WhatsApp admin (+62 858-7958-2495).'; return; }
  $('#send-status').textContent = 'WhatsApp dibuka di jendela baru. Tekan kirim di sana untuk mengirim pesan.';
});

/* ---------- header, menu, progres ---------- */
var topbar = $('#top'), drawer = $('#drawer'), menuBtn = $('#menu-btn'), prog = $('#progress');
function setDrawer(o){ drawer.classList.toggle('open', o); drawer.setAttribute('aria-hidden', String(!o)); menuBtn.setAttribute('aria-expanded', String(o)); if (o) $('#drawer-x').focus({preventScroll:true}); }
menuBtn.addEventListener('click', function(){ setDrawer(true); });
$('#drawer-x').addEventListener('click', function(){ setDrawer(false); menuBtn.focus({preventScroll:true}); });
drawer.addEventListener('click', function(e){ if (e.target.closest('a')) setDrawer(false); });
var secs = ['tentang','layanan','portofolio','legalitas','klien','kontak'].map(function(id){return document.getElementById(id);});
var heroEl = $('#beranda');
function headerH(){ return topbar.classList.contains('solid') ? $('.bar', topbar).offsetHeight : topbar.offsetHeight; }
function onScroll(){
  var y = scrollY;
  topbar.classList.toggle('solid', y > heroEl.offsetHeight - 90);
  var max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  var act = null, probe = y + 140;
  secs.forEach(function(s){ if (s.offsetTop <= probe) act = s.id; });
  $$('.nav a').forEach(function(a){ a.classList.toggle('active', a.getAttribute('href')==='#'+act); });
  reel();
}
/* video teaser: kartu membesar sampai layar penuh saat digulir */
var reelSec = $('#video'), reelCard = $('#reel-card');
function reel(){
  if (RM || innerWidth <= 860) { reelCard.style.transform=''; reelCard.style.borderRadius=''; return; }
  var r = reelSec.getBoundingClientRect(), travel = r.height - innerHeight;
  var p = Math.min(1, Math.max(0, (-r.top + innerHeight*0.15) / (travel*0.75)));
  var e = 1 - Math.pow(1-p, 2);
  reelCard.style.transform = 'scale(' + (0.84 + 0.16*e).toFixed(4) + ')';
  reelCard.style.borderRadius = (28*(1-e)).toFixed(1) + 'px';
}
addEventListener('scroll', onScroll, {passive:true}); addEventListener('resize', onScroll); onScroll();

/* ---------- gulir halus ---------- */
var SPEED = 1;
function scrollToEl(target, dur){
  var off = target.id==='beranda' ? 0 : ($('.bar', topbar).offsetHeight - 2);
  var y = Math.max(0, target.getBoundingClientRect().top + scrollY - off);
  return scrollToY(y, dur);
}
function scrollToY(y, dur){
  y = Math.min(y, document.documentElement.scrollHeight - innerHeight);
  return new Promise(function(res){
    var start = scrollY, dist = y - start;
    dur = (dur || Math.min(1500, 500 + Math.abs(dist)*0.3)) / SPEED;
    if (RM || Math.abs(dist) < 2) { scrollTo(0, y); return res(); }
    var t0 = performance.now();
    (function f(now){ var t=Math.min(1,(now-t0)/dur), e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; scrollTo(0, start+dist*e); if(t<1) requestAnimationFrame(f); else res(); })(t0);
  });
}
document.addEventListener('click', function(e){
  var a = e.target.closest('a[href^="#"]'); if(!a) return;
  var id = a.getAttribute('href').slice(1), t = id && document.getElementById(id); if(!t) return;
  e.preventDefault(); scrollToEl(t);
  if (!EMBED) { try { history.replaceState(null, '', '#'+id); } catch(err){} }
});

/* ---------- reveal + hitung naik ---------- */
function countUp(el){
  var to = +el.getAttribute('data-to'), t0 = performance.now(), d = 1400;
  (function f(now){ var t=Math.min(1,(now-t0)/d), e=1-Math.pow(1-t,3); el.textContent = Math.round(to*e); if (t<1) requestAnimationFrame(f); })(t0);
}
if (!RM && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  document.body.classList.add('intro-anim');
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); var c = $('.count', e.target); if (c && !c.dataset.done) { c.dataset.done = 1; countUp(c); } io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -6% 0px', threshold:.06});
  $$('[data-reveal]').forEach(function(el){
    var r = el.getBoundingClientRect();
    if (r.top < innerHeight * .94 && r.bottom > 0) { el.classList.add('in'); }
    else { var c = $('.count', el); if (c) c.textContent = '0'; io.observe(el); }
  });
}

/* ---------- mesin simulasi (aktif hanya di dalam simulasi.html) ---------- */
function post(m){ try { parent.postMessage(Object.assign({src:'457site'}, m), '*'); } catch(err){} }
if (!EMBED) return;
$('#sim-pill').style.display = 'none';
var cur = $('#sim-cursor'), cx = innerWidth*0.6, cy = innerHeight*0.4;
function wait(ms){ return new Promise(function(r){ setTimeout(r, ms/SPEED); }); }
function placeCursor(x, y){ cx=x; cy=y; cur.style.transform='translate('+(x-4)+'px,'+(y-3)+'px)'; }
function moveCursor(x, y, dur){
  cur.classList.add('on');
  return new Promise(function(res){
    var sx=cx, sy=cy, t0=performance.now(); dur=(dur||650)/SPEED;
    if (RM) { placeCursor(x,y); return res(); }
    (function f(now){ var t=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-t,3); placeCursor(sx+(x-sx)*e, sy+(y-sy)*e); if(t<1) requestAnimationFrame(f); else res(); })(t0);
  });
}
function q(sel){ var e = document.querySelector(sel); if(!e) throw new Error('Elemen tidak ditemukan: '+sel); return e; }
async function ensureVisible(e){
  var r = e.getBoundingClientRect(), hh = headerH();
  if (r.top < hh + 8 || r.bottom > innerHeight - 20) {
    var y = scrollY + r.top - Math.max(hh + 24, (innerHeight - r.height)/2);
    await scrollToY(Math.max(0, y));
    await wait(120);
  }
}
async function moveTo(sel){ var e=q(sel); if(!$('.layer.open')) await ensureVisible(e); var r=e.getBoundingClientRect(); await moveCursor(r.left+Math.min(r.width*0.5, r.width-10), r.top+Math.min(r.height*0.5, 40)); return e; }
async function clickEl(sel){ var e = await moveTo(sel); cur.classList.remove('press'); void cur.offsetWidth; cur.classList.add('press'); await wait(220); e.click(); await wait(250); }
async function typeIn(sel, text){
  var e = await moveTo(sel); e.focus({preventScroll:true}); e.value='';
  for (var i=0;i<text.length;i++){ e.value += text[i]; e.dispatchEvent(new Event('input', {bubbles:true})); await wait(RM?0:38); }
}
async function selectIn(sel, value){ var e = await moveTo(sel); e.focus({preventScroll:true}); await wait(250); e.value=value; e.dispatchEvent(new Event('change', {bubbles:true})); e.dispatchEvent(new Event('input', {bubbles:true})); await wait(200); }
function highlight(sel, ms){ var e=q(sel); e.classList.add('sim-hl'); setTimeout(function(){ e.classList.remove('sim-hl'); }, (ms||1600)/SPEED); }
function openAcc(id){ var it = q(id); if (!it.classList.contains('open')) $('.acc-head', it).click(); }
function reset(){
  closeLB(); closeVideo(); setDrawer(false);
  $$('.chip', filters).forEach(function(c){c.setAttribute('aria-pressed', String(c.getAttribute('data-f')==='semua'));}); applyFilter('semua'); movePill(false);
  form.reset(); $('#summary').classList.remove('show'); $$('.field.invalid').forEach(function(f){f.classList.remove('invalid');});
  $$('.acc-item').forEach(function(it, i){ it.classList.toggle('open', i===0); $('.acc-head', it).setAttribute('aria-expanded', String(i===0)); });
  scrollTo(0,0);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  placeCursor(innerWidth*0.62, innerHeight*0.45);
}
var ACT = {
  reset: function(){ reset(); },
  scroll: function(a){ return scrollToEl(q(a.to)); },
  scrolly: function(a){ var y = a.y; if (y==='reel') { y = reelSec.offsetTop + Math.max(0, reelSec.offsetHeight - innerHeight) * 0.85; } return scrollToY(y, 1600); },
  move: function(a){ return moveTo(a.to); },
  click: function(a){ return clickEl(a.to); },
  type: function(a){ return typeIn(a.to, a.text); },
  select: function(a){ return selectIn(a.to, a.value); },
  wait: function(a){ return wait(a.ms); },
  highlight: function(a){ highlight(a.to, a.ms); },
  filter: function(a){ setFilter(a.value); return wait(500); },
  openAcc: function(a){ openAcc(a.to); return wait(700); },
  hide: function(){ cur.classList.remove('on'); },
  closeAll: function(){ closeLB(); closeVideo(); setDrawer(false); },
  ensureQuote: function(){
    closeLB(); closeVideo();
    if ($('#summary').classList.contains('show')) return;
    $('#q-nama').value='Andi Pratama'; $('#q-org').value='CV Contoh Mandiri'; $('#q-hp').value='0812-0000-0000';
    $('#q-jenis').value='Drainase & penanganan tanah'; $('#q-lokasi').value='Kec. Warungasem, Kab. Batang'; $('#q-mulai').value='Dalam 1 bulan';
    $('#q-detail').value='Pembuatan saluran U-ditch sekitar 150 m di depan gudang.';
    form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', {cancelable:true}));
    return wait(600);
  }
};
addEventListener('message', async function(ev){
  var m = ev.data; if(!m || m.src!=='457sim') return;
  if (m.type==='speed') { SPEED = m.value || 1; return; }
  if (m.type!=='act') return;
  try { var r = ACT[m.a.a] && ACT[m.a.a](m.a); if (r && r.then) await r; post({type:'done', id:m.id}); }
  catch(err){ post({type:'done', id:m.id, error:String(err && err.message || err)}); }
});
['pointerdown','keydown','wheel','touchstart'].forEach(function(t){ addEventListener(t, function(e){ if(e.isTrusted) post({type:'user'}); }, {passive:true, capture:true}); });
reset();
post({type:'ready'});
})();
