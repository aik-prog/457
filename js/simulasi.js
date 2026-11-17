(function(){
'use strict';
var $ = function(s){return document.querySelector(s);};
var $$ = function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};

var STEPS = [
  {t:'Pengunjung membuka website', d:'Calon klien tiba di beranda. Video proyek diputar di latar, dengan prinsip kerja perusahaan: tepat biaya, mutu, dan waktu.',
   acts:[{a:'reset'},{a:'wait',ms:1200},{a:'move',to:'.hero h1'},{a:'wait',ms:600},{a:'move',to:'#cta-porto'},{a:'wait',ms:400},{a:'move',to:'#play-hero'},{a:'wait',ms:300}]},
  {t:'Menonton video teaser', d:'Tombol Putar video teaser membuka video 28 detik tentang jenis pekerjaan perusahaan.',
   acts:[{a:'click',to:'#play-hero'},{a:'wait',ms:5200},{a:'click',to:'#vm-x'},{a:'wait',ms:500}]},
  {t:'Mengenal perusahaan', d:'Menggulir ke angka ringkas, video yang membesar sampai layar penuh, lalu profil, visi, dan misi.',
   acts:[{a:'scroll',to:'#mulai'},{a:'highlight',to:'#facts',ms:1800},{a:'move',to:'#facts .stat:nth-child(2)'},{a:'wait',ms:900},{a:'scroll',to:'#video'},{a:'wait',ms:900},{a:'scrolly',y:'reel'},{a:'wait',ms:700},
     {a:'scroll',to:'#tentang'},{a:'move',to:'.about blockquote'},{a:'wait',ms:1200},{a:'move',to:'.misi'},{a:'wait',ms:800}]},
  {t:'Memilih layanan', d:'Di bagian Layanan, pengunjung membuka kelompok pekerjaan yang dibutuhkan, di sini drainase, lalu melihat proyeknya.',
   acts:[{a:'scroll',to:'#layanan'},{a:'move',to:'#svc-jalan .acc-title'},{a:'wait',ms:500},{a:'click',to:'#svc-air .acc-head'},{a:'wait',ms:1100},{a:'highlight',to:'#svc-air .acc-media',ms:1400},{a:'click',to:'#svc-air [data-cat]'},{a:'wait',ms:1100}]},
  {t:'Memfilter portofolio', d:'Website langsung menampilkan proyek drainase. Filter lain dipilih untuk melihat pekerjaan mekanikal, elektrikal, dan plumbing.',
   acts:[{a:'move',to:'.chip[data-f="air"]'},{a:'wait',ms:1100},{a:'click',to:'.chip[data-f="mep"]'},{a:'wait',ms:1100}]},
  {t:'Membuka foto proyek', d:'Foto proyek dibuka dalam ukuran besar dan digeser satu per satu.',
   acts:[{a:'filter',value:'mep'},{a:'click',to:'.tile[data-i="1"]'},{a:'wait',ms:1000},{a:'click',to:'#lb-next'},{a:'wait',ms:900},{a:'click',to:'#lb-next'},{a:'wait',ms:900},{a:'click',to:'#lb-x'},{a:'wait',ms:400}]},
  {t:'Memeriksa legalitas', d:'Calon mitra memeriksa dokumen resmi seperti Sertifikat Badan Usaha sebelum memutuskan kerja sama.',
   acts:[{a:'scroll',to:'#legalitas'},{a:'move',to:'#doc-akta'},{a:'wait',ms:400},{a:'click',to:'#doc-sbu'},{a:'wait',ms:1600},{a:'click',to:'#lb-x'},{a:'wait',ms:300}]},
  {t:'Melihat daftar klien', d:'Logo klien berjalan dalam dua baris dan berhenti saat disorot.',
   acts:[{a:'scroll',to:'#klien'},{a:'move',to:'#clients .marquee'},{a:'wait',ms:1300},{a:'move',to:'#clients .marquee.rev'},{a:'wait',ms:900}]},
  {t:'Mengisi form penawaran', d:'Pengunjung mengisi form dengan data contoh. Website menyusun pesan permintaan penawaran secara otomatis.',
   acts:[{a:'scroll',to:'#kontak'},{a:'type',to:'#q-nama',text:'Andi Pratama'},{a:'type',to:'#q-org',text:'CV Contoh Mandiri'},{a:'type',to:'#q-hp',text:'0812-0000-0000'},
     {a:'select',to:'#q-jenis',value:'Drainase & penanganan tanah'},{a:'type',to:'#q-lokasi',text:'Kec. Warungasem, Kab. Batang'},{a:'select',to:'#q-mulai',value:'Dalam 1 bulan'},
     {a:'type',to:'#q-detail',text:'Pembuatan saluran U-ditch sekitar 150 m di depan gudang.'},{a:'click',to:'#q-submit'},{a:'wait',ms:1100}]},
  {t:'Pesan sampai ke admin', d:'Pengunjung menekan Kirim lewat WhatsApp. Di panel admin, pesan permintaan penawaran diterima Rangga Yudhi.',
   acts:[{a:'ensureQuote'},{a:'move',to:'#msg'},{a:'wait',ms:1000},{a:'click',to:'#send-wa'},{a:'wait',ms:2200},{a:'hide'}]}
];

var frame = $('#site'), device = $('#device'), holder = $('#holder'), stage = $('#stage');
var DEV = {desktop:{w:1280,h:960,cls:'desktop'}, tablet:{w:820,h:1100,cls:'tablet'}, hp:{w:390,h:760,cls:'hp'}};
var devName = innerWidth < 820 ? 'hp' : 'desktop';
var ready = false, playing = false, idx = 0, token = 0, seq = 0, waiters = {}, speed = 1, finished = false;

/* ---------- perangkat ---------- */
function layout(){
  var d = DEV[devName];
  device.className = 'device ' + d.cls;
  frame.style.width = d.w + 'px'; frame.style.height = d.h + 'px';
  var ow = device.offsetWidth, oh = device.offsetHeight;
  var sw = stage.clientWidth - 44, sh = stage.clientHeight - 90;
  var s = Math.min(1, sw/ow, sh/oh);
  device.style.transform = 'scale(' + s + ')';
  holder.style.width = (ow*s) + 'px'; holder.style.height = (oh*s) + 'px';
}
$('#devices').addEventListener('click', function(e){
  var b = e.target.closest('button'); if(!b) return;
  devName = b.getAttribute('data-d');
  $$('#devices button').forEach(function(x){ x.setAttribute('aria-pressed', String(x===b)); });
  layout();
  if (playing) { var i = idx; stop(); setTimeout(function(){ play(i); }, 350); }
});
$$('#devices button').forEach(function(x){ x.setAttribute('aria-pressed', String(x.getAttribute('data-d')===devName)); });
addEventListener('resize', layout);
layout();

/* ---------- komunikasi dengan website ---------- */
function send(a){
  return new Promise(function(res){
    var id = ++seq; waiters[id] = res;
    setTimeout(function(){ if(waiters[id]){ delete waiters[id]; res({timeout:true}); } }, 20000);
    frame.contentWindow.postMessage({src:'457sim', type:'act', id:id, a:a}, '*');
  });
}
addEventListener('message', function(ev){
  var m = ev.data; if(!m || m.src!=='457site') return;
  if (m.type==='ready') { ready = true; $('#fallback').classList.remove('show'); frame.contentWindow.postMessage({src:'457sim', type:'speed', value:speed}, '*'); if (!booted) { booted = true; setTimeout(function(){ play(0); }, 900); } else if (pendingPlay != null) { var p = pendingPlay; pendingPlay = null; play(p); } }
  else if (m.type==='done') { var w = waiters[m.id]; if (w) { delete waiters[m.id]; w(m); } }
  else if (m.type==='user') { if (playing && !autoAct) { stop(); note('Simulasi dijeda karena Anda mencoba website sendiri. Tekan Lanjutkan untuk meneruskan.'); } }
  else if (m.type==='sim-quote') { $('#pending').classList.add('show'); }
  else if (m.type==='sim-send') { receive(m.text); }
});
var booted = false, pendingPlay = null, autoAct = false;
setTimeout(function(){ if(!ready){ $('#fallback').classList.add('show'); $('#cap-t').textContent='Pratinjau tidak merespons'; } }, 8000);

/* ---------- chat admin ---------- */
function clearChat(){
  $$('#chat .bub, #chat .typing').forEach(function(n){ n.remove(); });
  $('#empty').style.display = ''; $('#pending').classList.remove('show');
}
function receive(text){
  $('#pending').classList.remove('show'); $('#empty').style.display = 'none';
  $$('#chat .bub, #chat .typing').forEach(function(n){ n.remove(); });
  var t = document.createElement('div'); t.className='typing'; t.innerHTML='<i></i><i></i><i></i>'; $('#chat').appendChild(t);
  setTimeout(function(){
    t.remove();
    var now = new Date(), hh = String(now.getHours()).padStart(2,'0')+'.'+String(now.getMinutes()).padStart(2,'0');
    var b = document.createElement('div'); b.className='bub';
    var who = document.createElement('span'); who.className='who'; who.textContent='+62 812-0000-0000 (contoh)';
    var body = document.createElement('span'); body.textContent = text;
    var tm = document.createElement('span'); tm.className='tm'; tm.textContent = hh;
    b.appendChild(who); b.appendChild(body); b.appendChild(tm); $('#chat').appendChild(b);
    if (innerWidth > 1240) b.scrollIntoView({block:'nearest'});
  }, 1100/speed);
}

/* ---------- pemutar ---------- */
var list = $('#steps');
list.innerHTML = STEPS.map(function(s, i){ return '<li><button type="button" data-i="'+i+'"><span>'+s.t+'</span><span class="st"></span></button></li>'; }).join('');
list.addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; var i=+b.getAttribute('data-i'); stop(); play(i); });

function ui(){
  var s = STEPS[idx];
  $('#now-n').textContent = 'Langkah ' + (idx+1) + ' dari ' + STEPS.length;
  $('#now-t').textContent = s.t; $('#now-d').textContent = s.d;
  $('#prog').style.width = (finished ? 100 : (idx/STEPS.length*100)) + '%';
  $$('#steps li').forEach(function(li, i){
    li.className = (finished || i < idx) ? 'done' : (i===idx ? 'cur' : '');
    li.querySelector('.st').textContent = (finished || i < idx) ? 'selesai' : (i===idx && playing ? 'berjalan' : '');
  });
  $('#play-l').textContent = playing ? 'Jeda' : (finished ? 'Putar lagi' : (idx>0 || started ? 'Lanjutkan' : 'Putar simulasi'));
  $('#play-ic').innerHTML = playing ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M7 4v16l13-8z"/>';
  $('#prev').disabled = idx===0; $('#next').disabled = idx>=STEPS.length-1;
  var cap = $('#cap'); cap.classList.toggle('live', playing);
  $('#cap-t').textContent = finished ? 'Simulasi selesai. Coba website di bingkai ini secara langsung.' : (playing ? s.t : (ready ? 'Dijeda: ' + s.t : 'Memuat website'));
}
var started = false;
function note(t){ var n=$('#note'); n.textContent=t; n.classList.toggle('show', !!t); }
function stop(){ token++; playing = false; autoAct = false; ui(); }

async function prep(i){
  /* langkah yang bergantung pada langkah sebelumnya disiapkan dulu */
  if (i === 0) clearChat();
  if (i === 9) { $$('#chat .bub').forEach(function(n){ n.remove(); }); $('#empty').style.display=''; }
  if (i > 0 && i !== 4 && i !== 9) await send({a:'closeAll'});
}
async function play(from){
  if (!ready) { pendingPlay = from; return; }
  var my = ++token; playing = true; finished = false; started = true; note('');
  if (from === 0) clearChat();
  for (var i = from; i < STEPS.length; i++) {
    idx = i; ui();
    await prep(i);
    var acts = STEPS[i].acts;
    for (var k = 0; k < acts.length; k++) {
      if (my !== token) return;
      autoAct = true;
      await send(acts[k]);
      autoAct = false;
    }
    if (my !== token) return;
    await new Promise(function(r){ setTimeout(r, 700/speed); });
  }
  if (my !== token) return;
  playing = false; finished = true; ui();
  note('Simulasi selesai. Anda bisa menggulir dan mengklik website di bingkai, atau memilih langkah mana saja di daftar.');
}
$('#play').addEventListener('click', function(){
  if (playing) { stop(); return; }
  if (finished) { finished = false; play(0); } else play(idx);
});
$('#prev').addEventListener('click', function(){ stop(); play(Math.max(0, idx-1)); });
$('#next').addEventListener('click', function(){ stop(); play(Math.min(STEPS.length-1, idx+1)); });
$('#restart').addEventListener('click', function(){ stop(); finished=false; play(0); });
$('#speeds').addEventListener('click', function(e){
  var b = e.target.closest('button'); if(!b) return;
  speed = +b.getAttribute('data-s');
  $$('#speeds button').forEach(function(x){ x.setAttribute('aria-pressed', String(x===b)); });
  frame.contentWindow.postMessage({src:'457sim', type:'speed', value:speed}, '*');
});
ui();
})();
