"""Menyusun halaman HTML website dari potongan bersama (header, footer, dll).

Jalankan dari folder utama repo setelah mengubah potongan di file ini:
    python tools/build_pages.py

Konten yang bisa diubah admin (kontak, portofolio, klien) tidak perlu lewat file ini:
ubah lewat halaman /admin. Nilai di data/content.json hanya dipakai sebagai cadangan.
"""
import json, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://457-gold.vercel.app/'
C = json.load(open(os.path.join(ROOT, 'data', 'content.json'), encoding='utf-8'))
CT = C['contact']
e = html.escape

NAV = [('tentang', 'Tentang'), ('layanan', 'Layanan'), ('portofolio', 'Portofolio'), ('legalitas', 'Legalitas'), ('kontak', 'Kontak')]

SPRITE = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="chev" viewBox="0 0 26 16"><path d="M1 0h6l7 8-7 8H1l7-8z" fill="#F5B54F"/><path d="M12 0h6l7 8-7 8h-6l7-8z" fill="#2A78B8"/></symbol>
    <symbol id="ar" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="arup" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="play" viewBox="0 0 24 24"><path d="M7 4v16l13-8z" fill="currentColor"/></symbol>
    <symbol id="xx" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
    <symbol id="ok" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="doc" viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M14 3v5h5M10 13h6M10 17h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
  </defs>
</svg>'''

def head(title, desc, path, page, robots='index, follow'):
    url = SITE + path
    # halaman 404 bisa tampil di alamat bertingkat, jadi alamat aset dibuat dari akar situs
    base = ('<script>document.write(\'<base href="\' + (/github\\.io$/.test(location.hostname) ? \'/457/\' : \'/\') + \'">\')</script>\n' if page == 'notfound' else '')
    t = ('CV. Empat Lima Tujuh' if page == 'home' else title + ' | CV. Empat Lima Tujuh')
    return f'''<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(t)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="{robots}">
{base}<link rel="icon" href="img/logo-457.png">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CV. Empat Lima Tujuh">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="{e(t)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}img/og-image.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="CV. Empat Lima Tujuh, general contractor and supplier. Tepat biaya, tepat mutu, tepat waktu.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITE}img/og-image.jpg">
<meta name="theme-color" content="#0A2944">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body data-page="{page}">
<a class="skip" href="#main">Lewati ke konten</a>
<div class="progress" id="progress" aria-hidden="true"></div>
{SPRITE}
'''

def header(page):
    links = '\n      '.join(
        f'<a href="{k}"{" class=\"current\" aria-current=\"page\"" if k == page else ""}>{v}</a>' for k, v in NAV)
    dlinks = ''.join(f'<a href="{k}" style="transition-delay:{(i + 1) * 0.05:.2f}s"{" aria-current=\"page\"" if k == page else ""}>{v}</a>' for i, (k, v) in enumerate(NAV))
    return f'''
<header class="top" id="top">
  <div class="util"><div class="wrap">
    <span>General contractor and supplier di Kab. Batang, Jawa Tengah</span>
    <div class="r"><a href="mailto:{e(CT['email'])}" data-link="mail" data-bind="email">{e(CT['email'])}</a><a href="https://wa.me/{CT['wa']}" target="_blank" rel="noopener" data-link="wa" data-bind="phone">{e(CT['phone'])}</a></div>
  </div></div>
  <div class="bar"><div class="wrap">
    <a class="brand" href="./" aria-label="CV. Empat Lima Tujuh, ke beranda">
      <img src="img/logo-457.png" alt="" width="38" height="27">
      <span><b>CV. Empat Lima Tujuh</b><small>General contractor and supplier</small></span>
    </a>
    <nav class="nav" id="nav" aria-label="Navigasi utama">
      {links}
    </nav>
    <a class="btn btn-signal" href="kontak" id="cta-top">Minta penawaran</a>
    <button class="menu-btn" id="menu-btn" aria-label="Buka menu" aria-expanded="false" aria-controls="drawer">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>
    </button>
  </div></div>
</header>

<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-top"><span class="brand" style="color:#fff"><img src="img/logo-457.png" alt="" width="38" height="27" style="filter:brightness(0) invert(1)"><span><b>CV. Empat Lima Tujuh</b></span></span>
    <button class="x-btn" id="drawer-x" aria-label="Tutup menu"><svg width="20" height="20"><use href="#xx"/></svg></button></div>
  <nav aria-label="Menu ponsel"><a href="./">Beranda</a>{dlinks}</nav>
  <a class="btn btn-signal" href="kontak">Minta penawaran</a>
</div>
'''

def page_hero(img, pos, crumb, title, lead):
    return f'''
<section class="page-hero">
  <img src="img/{img}" alt="" style="object-position:{pos}" fetchpriority="high">
  <div class="wrap">
    <ol class="crumbs"><li><a href="./">Beranda</a></li><li aria-current="page">{e(crumb)}</li></ol>
    <h1>{e(title)}</h1>
    <p class="lead">{e(lead)}</p>
  </div>
</section>
'''

CTA = '''
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="cta-band" data-reveal="scale">
      <div><h2>Siap memulai proyek?</h2><p>Ceritakan pekerjaan yang Anda rencanakan. Kami membalas dengan jadwal survei dan penawaran.</p></div>
      <div class="row"><a class="btn btn-signal" href="kontak">Minta penawaran <svg class="ar"><use href="#ar"/></svg></a><a class="btn btn-glass" href="https://wa.me/{wa}" target="_blank" rel="noopener" data-link="wa">Chat WhatsApp</a></div>
    </div>
  </div>
</section>
'''.replace('{wa}', CT['wa'])

CLIENTS = '''
<section class="sec soft" id="klien">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <div><p class="label">Klien</p><h2>Dipercaya oleh mitra kami</h2><p class="sub">Perusahaan dan instansi yang pernah bekerja sama dengan CV. Empat Lima Tujuh.</p></div>
    </div>
  </div>
  <div data-reveal="fade" id="clients"></div>
</section>
'''

def footer():
    return f'''
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="./"><img src="img/logo-457.png" alt="" width="38" height="27"><span><b>CV. Empat Lima Tujuh</b><small>General contractor and supplier</small></span></a>
        <p class="addr" data-bind="address">{e(CT['address'])}</p>
      </div>
      <div><h4>Perusahaan</h4><ul><li><a href="tentang">Tentang kami</a></li><li><a href="tentang#komitmen">Komitmen kerja</a></li><li><a href="legalitas">Legalitas</a></li><li><a href="tentang#klien">Klien</a></li></ul></div>
      <div><h4>Layanan</h4><ul><li><a href="portofolio#jalan">Jalan &amp; fasilitas jalan</a></li><li><a href="portofolio#air">Drainase &amp; penanganan tanah</a></li><li><a href="portofolio#fo">Jaringan fiber optik</a></li><li><a href="portofolio#mep">Mekanikal, elektrikal &amp; plumbing</a></li><li><a href="layanan#svc-supply">Supplier</a></li></ul></div>
      <div><h4>Kontak</h4><ul><li><a href="https://wa.me/{CT['wa']}" target="_blank" rel="noopener" data-link="wa"><span data-bind="phone">{e(CT['phone'])}</span> (<span data-bind="person">{e(CT['person'])}</span>)</a></li><li><a href="mailto:{e(CT['email'])}" data-link="mail" data-bind="email">{e(CT['email'])}</a></li><li><a href="kontak">Form minta penawaran</a></li></ul></div>
    </div>
    <div class="copy"><span>© 2026 CV. Empat Lima Tujuh (457Corp)</span><span>Kab. Batang, Jawa Tengah</span></div>
  </div>
</footer>
'''

LIGHTBOX = '''
<div class="layer" id="lb" role="dialog" aria-modal="true" aria-labelledby="lb-title" aria-hidden="true">
  <div class="layer-top"><div><b id="lb-title"></b><br><span id="lb-sub"></span></div>
    <button class="x-btn" id="lb-x" aria-label="Tutup"><svg width="20" height="20"><use href="#xx"/></svg></button></div>
  <div class="lb-stage">
    <img id="lb-img" alt="">
    <button class="lb-nav lb-prev" id="lb-prev" aria-label="Foto sebelumnya"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg></button>
    <button class="lb-nav lb-next" id="lb-next" aria-label="Foto berikutnya"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></button>
  </div>
  <div class="lb-dots" id="lb-dots"></div>
</div>
'''

VIDEO = '''
<div class="layer" id="vm" role="dialog" aria-modal="true" aria-label="Video teaser 457Corp" aria-hidden="true">
  <div class="layer-top"><div><b>Video teaser 457Corp</b><br><span>28 detik, dengan musik</span></div>
    <button class="x-btn" id="vm-x" aria-label="Tutup video"><svg width="20" height="20"><use href="#xx"/></svg></button></div>
  <div class="vm-stage"><video id="vm-video" controls playsinline preload="none" poster="img/teaser-poster.webp"><source src="media/teaser.mp4" type="video/mp4"></video></div>
</div>
'''

def tail(layers=''):
    return f'''{footer()}{layers}
<a class="fab" href="https://wa.me/{CT['wa']}" target="_blank" rel="noopener" aria-label="Chat admin lewat WhatsApp" data-link="wa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 10h6M9 13h4"/></svg><span>Chat admin</span></a>
<script src="js/site.js"></script>
</body>
</html>
'''

CATS = [
    ('jalan', 'Jalan & fasilitas jalan', 'Rambu, reflektor, guardrail, MCB, dan perkerasan beton.', 'p-guardrail-1.webp', '50% 50%'),
    ('air', 'Drainase & penanganan tanah', 'U-ditch, drainase beton, bronjong, dan penanganan longsor.', 'p-u-ditch-1.webp', '50% 50%'),
    ('fo', 'Jaringan fiber optik', 'Pemasangan jalur, instalasi, dan pengukuran OTDR.', 'p-instalasi-fo-1-t.webp', '50% 40%'),
    ('mep', 'Mekanikal, elektrikal & plumbing', 'Panel listrik, penerangan jalan, genset, dan pipa HDPE.', 'hero-pju.webp', '60% 30%'),
]

VALUES = '''
      <div class="values">
        <div class="value" data-reveal><div class="vi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 15a8 8 0 0 1 16 0"/><path d="M2.5 15h19v2.5h-19z"/><path d="M10 7.3V5h4v2.3"/><path d="M12 7v4"/></svg></div><h3>Profesional</h3><p>Tim lapangan yang memahami standar teknis dan K3.</p></div>
        <div class="value" data-reveal style="--i:1"><div class="vi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8.5 12.5 2.5 2.5 5-6"/></svg></div><h3>Tepat mutu</h3><p>Hasil sesuai spesifikasi dan gambar yang disepakati.</p></div>
        <div class="value" data-reveal style="--i:2"><div class="vi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></svg></div><h3>Efisiensi waktu</h3><p>Jadwal dijaga agar pekerjaan selesai sesuai target.</p></div>
        <div class="value" data-reveal style="--i:3"><div class="vi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg></div><h3>Inovatif</h3><p>Teknologi dan metode yang membuat kerja lebih aman.</p></div>
        <div class="value" data-reveal style="--i:4"><div class="vi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19 13 11"/></svg></div><h3>Ramah lingkungan</h3><p>Praktik yang menjaga lingkungan sekitar lokasi kerja.</p></div>
      </div>'''

# ------------------------------------------------------------------ halaman
def home():
    cards = '\n'.join(f'''      <a class="svc-card" href="layanan#svc-{k}" data-reveal style="--i:{i}"><img src="img/{img}" alt="" loading="lazy" style="object-position:{pos}"><span class="go"><svg><use href="#arup"/></svg></span><small data-count-cat="{k}">Layanan</small><b>{e(t)}</b><p>{e(d)}</p></a>''' for i, (k, t, d, img, pos) in enumerate(CATS))
    return head('Beranda', 'CV. Empat Lima Tujuh (457Corp), general contractor and supplier di Kab. Batang, Jawa Tengah. Pekerjaan jalan, drainase, fiber optik, mekanikal, elektrikal, dan plumbing.', '', 'home') + header('home') + f'''
<main id="main">
<section class="hero" id="beranda">
  <div class="hero-media" aria-hidden="true">
    <img src="img/hero-poster.webp" alt="" fetchpriority="high">
    <video id="hero-video" muted loop playsinline preload="auto" poster="img/hero-poster.webp"><source src="media/hero-loop.mp4" type="video/mp4"></video>
  </div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="wrap hero-inner">
    <p class="hero-tag"><svg><use href="#chev"/></svg>457Corp, kontraktor dari Kab. Batang</p>
    <h1><span class="ln"><span>Tepat biaya, tepat mutu,</span></span><span class="ln"><span>tepat waktu.</span></span></h1>
    <p class="hero-lead">Kami mengerjakan jalan dan fasilitasnya, drainase, jaringan fiber optik, serta mekanikal, elektrikal, dan plumbing, dengan keselamatan kerja sebagai prioritas di setiap lokasi proyek.</p>
    <div class="hero-cta">
      <a class="btn btn-white" href="portofolio" id="cta-porto">Lihat portofolio <svg class="ar"><use href="#ar"/></svg></a>
      <button class="btn btn-glass" type="button" id="play-hero"><span class="play-ic"><svg><use href="#play"/></svg></span>Putar video teaser</button>
    </div>
  </div>
  <div class="wrap hero-foot">
    <a class="cue" href="#mulai"><span class="mouse" aria-hidden="true"></span>Gulir untuk mengenal 457Corp</a>
    <div class="scenes" id="scenes" aria-hidden="true"><span id="scene-name">Elektrikal jalan</span><i></i><i></i><i></i><i></i><i></i><i></i></div>
  </div>
</section>

<section class="sec" id="mulai">
  <div class="wrap">
    <div class="intro-grid">
      <div data-reveal><p class="label">Mulai bersama kami</p><h2>Mulai proyek Anda bersama 457Corp</h2></div>
      <div data-reveal style="--i:1">
        <p>Dari survei lokasi sampai serah terima, kami menangani pekerjaan fisik di ruas jalan tol, kawasan industri, dan fasilitas umum di wilayah Brebes, Pemalang, hingga Batang.</p>
        <div class="row"><a class="btn btn-navy" href="tentang">Tentang kami <svg class="ar"><use href="#ar"/></svg></a><a class="btn btn-line" href="legalitas">Lihat legalitas</a></div>
      </div>
    </div>
    <div class="stats" id="facts">
      <div class="stat" data-reveal><b class="count" data-to="24" id="stat-jobs">24</b><span>Jenis pekerjaan</span><small>Dari rambu jalan sampai penyambungan pipa HDPE</small></div>
      <div class="stat" data-reveal style="--i:1"><b class="count" data-to="15" id="stat-clients">15</b><span>Klien</span><small>Kontraktor BUMN, pengelola tol, kawasan industri, dan usaha lokal</small></div>
      <div class="stat" data-reveal style="--i:2"><b class="count" data-to="5">5</b><span>Dokumen legalitas</span><small>Akta pendirian, NIB, SBU, SKT, dan NPWP</small></div>
    </div>
  </div>
</section>

<section class="reel" id="video" aria-label="Video teaser">
  <div class="reel-sticky">
    <div class="reel-card" id="reel-card">
      <video id="reel-video" muted loop playsinline preload="none" poster="img/teaser-poster.webp"><source src="media/teaser.mp4" type="video/mp4"></video>
      <div class="reel-shade"></div>
      <button class="reel-play" type="button" id="reel-play"><span class="play-ic"><svg><use href="#play"/></svg></span>Putar video</button>
      <p class="reel-cap"><b>Video teaser 457Corp</b>28 detik, dengan musik</p>
    </div>
  </div>
</section>

<section class="sec" id="layanan-ringkas">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <div><p class="label">Layanan</p><h2>Pekerjaan yang kami tangani</h2><p class="sub">Empat kelompok pekerjaan, ditambah pengadaan barang untuk kebutuhan proyek.</p></div>
      <a class="link" href="layanan">Semua layanan <svg class="ar"><use href="#ar"/></svg></a>
    </div>
    <div class="svc-cards">
{cards}
    </div>
  </div>
</section>

<section class="sec soft" id="proyek">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <div><p class="label">Portofolio</p><h2>Proyek di lapangan</h2><p class="sub">Sebagian dokumentasi pekerjaan kami. Klik foto untuk melihat lebih besar.</p></div>
      <a class="link" href="portofolio">Semua portofolio <svg class="ar"><use href="#ar"/></svg></a>
    </div>
    <div class="grid" id="grid" data-limit="7"></div>
    <div class="more"><a class="btn btn-navy" href="portofolio">Lihat semua portofolio <svg class="ar"><use href="#ar"/></svg></a></div>
  </div>
</section>
{CLIENTS.replace('class="sec soft"', 'class="sec"')}
{CTA}
</main>
''' + tail(LIGHTBOX + VIDEO)

def tentang():
    return head('Tentang kami', 'Profil CV. Empat Lima Tujuh (457Corp): visi, misi, dan komitmen kerja kontraktor dari Kab. Batang, Jawa Tengah.', 'tentang', 'tentang') + header('tentang') + page_hero(
        'hero-pju.webp', '60% 30%', 'Tentang kami', 'Perusahaan konstruksi yang mengutamakan keselamatan kerja',
        'General contractor and supplier dari Desa Terban, Warungasem, Kabupaten Batang, dengan prinsip tepat biaya, mutu, dan waktu.') + f'''
<main id="main">
<section class="sec">
  <div class="wrap">
    <div class="about-text">
      <p data-reveal>CV. Empat Lima Tujuh, dikenal juga sebagai 457Corp, adalah general contractor and supplier yang berkantor di Desa Terban, Kecamatan Warungasem, Kabupaten Batang. Kami bekerja dengan prinsip tepat biaya, mutu, dan waktu.</p>
      <p data-reveal style="--i:1">Pekerjaan kami mencakup perlengkapan jalan, saluran dan drainase, jaringan fiber optik, hingga instalasi mekanikal, elektrikal, dan plumbing, bersama kontraktor utama, pengelola jalan tol, kawasan industri, dan pelaku usaha di wilayah Brebes, Pemalang, hingga Batang.</p>
    </div>
    <div class="about" data-reveal="scale">
      <div class="about-photo"><img src="img/p-mekanikal-elektrikal-1.webp" alt="Teknisi 457Corp memeriksa genset pada pekerjaan mekanikal elektrikal" loading="lazy"><span>Pekerjaan mekanikal elektrikal</span></div>
      <div class="about-body">
        <h3>Visi</h3>
        <blockquote>Menjadi perusahaan konstruksi terkemuka yang memberikan hasil terbaik dengan mengutamakan kualitas, keselamatan, dan keberlanjutan.</blockquote>
        <hr>
        <h3>Misi</h3>
        <ol class="misi">
          <li>Menyediakan layanan konstruksi berkualitas tinggi yang tepat waktu dan sesuai anggaran.</li>
          <li>Adaptasi teknologi sehingga meningkatkan efisiensi dan keselamatan kerja.</li>
          <li>Menciptakan hubungan baik serta implementasi praktik konstruksi yang ramah lingkungan dan berkelanjutan.</li>
        </ol>
      </div>
    </div>
  </div>
</section>
<section class="sec soft" id="komitmen">
  <div class="wrap">
    <div class="sec-head" data-reveal><div><p class="label">Komitmen kerja</p><h2>Lima hal yang kami pegang di setiap pekerjaan</h2></div></div>
{VALUES}
    <a class="legal-teaser" href="legalitas" data-reveal><span class="ic"><svg><use href="#doc"/></svg></span><span><b>Legalitas perusahaan</b><span>Akta pendirian, NIB, SBU, SKT, dan NPWP dapat diperiksa sebelum kerja sama.</span></span><span class="link">Lihat dokumen <svg class="ar"><use href="#ar"/></svg></span></a>
  </div>
</section>
{CLIENTS.replace('class="sec soft"', 'class="sec"')}
{CTA}
</main>
''' + tail()

def layanan():
    return head('Layanan', 'Layanan CV. Empat Lima Tujuh: jalan dan fasilitas jalan, drainase, jaringan fiber optik, mekanikal elektrikal plumbing, dan supplier.', 'layanan', 'layanan') + header('layanan') + page_hero(
        'p-guardrail-1.webp', '50% 50%', 'Layanan', 'Pekerjaan yang kami tangani',
        'Dikelompokkan dari proyek yang sudah kami kerjakan. Buka satu kelompok untuk melihat rincian dan foto proyeknya.') + f'''
<main id="main">
<section class="sec">
  <div class="wrap">
    <div class="acc" id="svc" data-reveal></div>
  </div>
</section>
{CTA}
</main>
''' + tail()

def portofolio():
    return head('Portofolio', 'Dokumentasi proyek CV. Empat Lima Tujuh di ruas jalan tol, kawasan industri, dan fasilitas umum.', 'portofolio', 'portofolio') + header('portofolio') + page_hero(
        'p-bronjong-1.webp', '50% 45%', 'Portofolio', 'Dokumentasi pekerjaan di lapangan',
        'Foto dari ruas jalan tol, kawasan industri, dan fasilitas umum. Pilih kategori, lalu klik foto untuk melihat lebih besar.') + f'''
<main id="main">
<section class="sec soft">
  <div class="wrap">
    <div data-reveal><div class="filters" id="filters" role="group" aria-label="Filter kategori portofolio"><span class="pill" id="pill" aria-hidden="true"></span></div></div>
    <div class="grid" id="grid"></div>
  </div>
</section>
{CTA.replace('class="sec" style="padding-top:0"', 'class="sec"')}
</main>
''' + tail(LIGHTBOX)

def legalitas():
    return head('Legalitas', 'Dokumen legalitas CV. Empat Lima Tujuh: akta pendirian, NIB, SBU, SKT, dan NPWP.', 'legalitas', 'legalitas') + header('legalitas') + page_hero(
        'p-rambu-fasilitas-1.webp', '50% 40%', 'Legalitas', 'Dokumen resmi perusahaan',
        'Dapat diperiksa calon mitra sebelum kerja sama. Klik dokumen untuk membuka setiap halamannya.') + f'''
<main id="main">
<section class="sec">
  <div class="wrap">
    <div class="docs" id="docs"></div>
  </div>
</section>
{CTA}
</main>
''' + tail(LIGHTBOX)

def kontak():
    return head('Kontak', 'Hubungi CV. Empat Lima Tujuh untuk minta penawaran pekerjaan jalan, drainase, fiber optik, mekanikal, elektrikal, dan plumbing.', 'kontak', 'kontak') + header('kontak') + page_hero(
        'p-u-ditch-1.webp', '50% 50%', 'Kontak', 'Minta penawaran proyek Anda',
        'Isi form di bawah. Permintaan Anda langsung masuk ke admin kami, lalu kami hubungi lewat WhatsApp untuk jadwal survei dan penawaran.') + f'''
<main id="main">
<section class="sec" id="kontak">
  <div class="wrap">
    <div class="contact" data-reveal="scale">
      <div>
        <p class="label" style="color:var(--signal)">Kontak</p>
        <h2>Bicara langsung dengan kami</h2>
        <p class="lead">Untuk pertanyaan cepat, hubungi admin lewat WhatsApp atau email.</p>
        <div class="info">
          <div><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg></span>
            <p><b>Alamat</b><span data-bind="address">{e(CT['address'])}</span><br><a href="{e(CT['maps'])}" target="_blank" rel="noopener" data-link="maps" style="color:var(--signal);font-weight:500;font-size:14px">Buka di Google Maps</a></p></div>
          <div><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg></span>
            <p><b>Telepon dan WhatsApp (<span data-bind="person">{e(CT['person'])}</span>)</b><a href="https://wa.me/{CT['wa']}" target="_blank" rel="noopener" data-link="wa" data-bind="phone">{e(CT['phone'])}</a></p></div>
          <div><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>
            <p><b>Email</b><a href="mailto:{e(CT['email'])}" data-link="mail" data-bind="email">{e(CT['email'])}</a></p></div>
        </div>
      </div>

      <form class="form" id="quote" novalidate>
        <h3>Minta penawaran</h3>
        <p>Kolom bertanda wajib: nama, nomor WhatsApp, dan jenis pekerjaan.</p>
        <div class="fields">
          <div class="field"><label for="q-nama">Nama</label><input id="q-nama" name="nama" autocomplete="name" required maxlength="80"><span class="err" id="err-nama">Isi nama Anda.</span></div>
          <div class="field"><label for="q-org">Instansi atau perusahaan</label><input id="q-org" name="org" autocomplete="organization" maxlength="120"></div>
          <div class="field"><label for="q-hp">Nomor WhatsApp</label><input id="q-hp" name="hp" inputmode="tel" autocomplete="tel" required placeholder="08xx-xxxx-xxxx" maxlength="30"><span class="err" id="err-hp">Isi nomor yang bisa dihubungi.</span></div>
          <div class="field"><label for="q-jenis">Jenis pekerjaan</label>
            <select id="q-jenis" name="jenis" required><option value="">Pilih jenis pekerjaan</option></select><span class="err" id="err-jenis">Pilih jenis pekerjaan.</span></div>
          <div class="field"><label for="q-lokasi">Lokasi proyek</label><input id="q-lokasi" name="lokasi" placeholder="Kecamatan, kabupaten" maxlength="160"></div>
          <div class="field"><label for="q-mulai">Rencana mulai</label>
            <select id="q-mulai" name="mulai"><option value="">Belum ditentukan</option><option>Secepatnya</option><option>Dalam 1 bulan</option><option>1 sampai 3 bulan lagi</option><option>Lebih dari 3 bulan lagi</option></select></div>
          <div class="field full"><label for="q-detail">Rincian pekerjaan</label><textarea id="q-detail" name="detail" maxlength="2000" placeholder="Contoh: pemasangan guardrail sepanjang 200 m, termasuk pengecatan"></textarea></div>
          <div class="hp-field" aria-hidden="true"><label for="q-website">Website</label><input id="q-website" name="website" tabindex="-1" autocomplete="off"></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-navy" type="submit" id="q-submit"><span class="spin" aria-hidden="true"></span>Kirim permintaan <svg class="ar"><use href="#ar"/></svg></button>
          <small>Data Anda hanya dipakai untuk menghubungi Anda soal penawaran ini.</small>
        </div>
        <p class="form-note" id="form-note" role="alert"></p>
        <div class="sent" id="sent" aria-live="polite">
          <div class="badge-ok"><svg><use href="#ok"/></svg></div>
          <h3>Permintaan Anda sudah kami terima</h3>
          <p id="sent-text">Admin kami akan menghubungi Anda lewat WhatsApp.</p>
          <span class="code" id="sent-code"></span>
          <div class="row"><a class="btn btn-wa" id="sent-wa" href="#" target="_blank" rel="noopener">Chat WhatsApp sekarang</a><button class="btn btn-line" type="button" id="sent-again">Kirim permintaan lain</button></div>
        </div>
        <div class="summary" id="summary" aria-live="polite"><div><div class="in">
          <h4>Kirim lewat WhatsApp atau email</h4>
          <pre id="msg"></pre>
          <div class="row">
            <a class="btn btn-wa" id="send-wa" href="#" target="_blank" rel="noopener">Kirim lewat WhatsApp</a>
            <a class="btn btn-line" id="send-mail" href="#">Kirim lewat email</a>
            <button class="btn btn-line" type="button" id="copy-msg">Salin pesan</button>
          </div>
          <p class="status" id="send-status"></p>
        </div></div></div>
      </form>
    </div>
  </div>
</section>
</main>
''' + tail()

def notfound():
    return head('Halaman tidak ditemukan', 'Halaman yang Anda cari tidak ada.', '404', 'notfound', robots='noindex') + header('') + '''
<main id="main">
<section class="nf">
  <div>
    <b>404</b>
    <h1 style="font-size:28px;color:var(--navy)">Halaman tidak ditemukan</h1>
    <p>Alamatnya mungkin salah ketik atau halamannya sudah dipindah.</p>
    <div class="row"><a class="btn btn-navy" href="./">Ke beranda <svg class="ar"><use href="#ar"/></svg></a><a class="btn btn-line" href="kontak">Hubungi kami</a></div>
  </div>
</section>
</main>
''' + tail()

PAGES = {'index.html': home, 'tentang.html': tentang, 'layanan.html': layanan, 'portofolio.html': portofolio,
         'legalitas.html': legalitas, 'kontak.html': kontak, '404.html': notfound}
for name, fn in PAGES.items():
    with open(os.path.join(ROOT, name), 'w', encoding='utf-8') as f:
        f.write(fn())
    print('tersusun:', name)
