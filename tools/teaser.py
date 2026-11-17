"""Render ulang video teaser dan video latar beranda CV. Empat Lima Tujuh.

Pemakaian (dari folder utama repo):
    python tools/teaser.py teaser   -> tools/output/teaser.mp4 (tanpa suara)
    python tools/teaser.py hero     -> tools/output/hero-loop.mp4
    python tools/teaser.py frames   -> beberapa gambar contoh untuk dicek

Butuh: Python 3.9+, pillow, numpy, ffmpeg di PATH, dan font Poppins
(Light, Regular, Medium) di tools/fonts/ atau folder FONT_DIR.
"""
import sys, os, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'img')
OUT = os.path.join(HERE, 'output')
MODE = sys.argv[1] if len(sys.argv) > 1 else 'teaser'
os.makedirs(OUT, exist_ok=True)
W, H, FPS, XF = 1280, 720, 30, 0.5
NAVY = (10, 41, 68); AMBER = (245, 181, 79); BLUE = (42, 120, 184); WHITE = (255, 255, 255)
def _font_dir():
    cands = [os.environ.get('FONT_DIR', ''), os.path.join(HERE, 'fonts'), '/usr/share/fonts/truetype/google-fonts',
             os.path.expanduser('~/Library/Fonts'), os.path.expanduser('~/.fonts'), 'C:/Windows/Fonts',
             os.path.expanduser('~/AppData/Local/Microsoft/Windows/Fonts')]
    for c in cands:
        if c and os.path.exists(os.path.join(c, 'Poppins-Medium.ttf')): return c + os.sep
    sys.exit('Font Poppins tidak ditemukan. Unduh dari https://fonts.google.com/specimen/Poppins lalu taruh '
             'Poppins-Light.ttf, Poppins-Regular.ttf, Poppins-Medium.ttf di tools/fonts/')
FD = _font_dir()
def font(w, s): return ImageFont.truetype(FD + {'l': 'Poppins-Light.ttf', 'r': 'Poppins-Regular.ttf', 'm': 'Poppins-Medium.ttf'}[w], s)
F = {}
def f(w, s):
    k = (w, s)
    if k not in F: F[k] = font(w, s)
    return F[k]

def ease_out(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def ease_io(x): x = min(1, max(0, x)); return 4*x*x*x if x < .5 else 1 - (-2*x + 2) ** 3 / 2

CACHE = {}
def src(name, target=(W, H), zmax=1.16):
    k = (name, target)
    if k in CACHE: return CACHE[k]
    im = Image.open(os.path.join(SRC, name)).convert('RGB')
    s = max(target[0] / im.width, target[1] / im.height) * zmax * 1.05
    if s < 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    CACHE[k] = im
    return im

def cover(name, tw, th, z, fx, fy):
    S = src(name, (tw, th))
    w, h = S.size
    s = max(tw / w, th / h)
    rw, rh = tw / (s * z), th / (s * z)
    x0 = min(max(fx * w - rw / 2, 0), w - rw); y0 = min(max(fy * h - rh / 2, 0), h - rh)
    return S.resize((tw, th), Image.BICUBIC, box=(x0, y0, x0 + rw, y0 + rh))

# ---------- brand pieces ----------
LOGO = Image.open(os.path.join(SRC, 'logo-457.png')).convert('RGBA')
def logo_white(height):
    a = LOGO.split()[3]
    lw = Image.new('RGBA', LOGO.size, WHITE + (0,)); lw.putalpha(a)
    r = height / lw.height
    return lw.resize((round(lw.width * r), height), Image.LANCZOS)
LOGO_W = {}
def lw(h):
    if h not in LOGO_W: LOGO_W[h] = logo_white(h)
    return LOGO_W[h]

def chevrons(draw, x, y, h, alpha=255):
    u = h / 16
    a = [(1, 0), (7, 0), (14, 8), (7, 16), (1, 16), (8, 8)]
    b = [(12, 0), (18, 0), (25, 8), (18, 16), (12, 16), (19, 8)]
    draw.polygon([(x + px * u, y + py * u) for px, py in a], fill=AMBER + (alpha,))
    draw.polygon([(x + px * u, y + py * u) for px, py in b], fill=BLUE + (alpha,))

GRAD_CACHE = {}
def bottom_grad(strength=0.72, start=0.35):
    k = (strength, start)
    if k not in GRAD_CACHE:
        y = np.linspace(0, 1, H)[:, None]
        a = np.clip((y - start) / (1 - start), 0, 1) ** 1.4 * strength
        x = np.linspace(0, 1, W)[None, :]
        a = np.maximum(a, np.clip(0.55 - x, 0, 1) * 0.55 * np.clip((y - 0.2) / 0.8, 0, 1))
        arr = np.zeros((H, W, 4), np.uint8); arr[..., 0:3] = (5, 16, 28); arr[..., 3] = (a * 255).astype(np.uint8)
        GRAD_CACHE[k] = Image.fromarray(arr, 'RGBA')
    return GRAD_CACHE[k]

def text(draw, xy, s, fnt, fill=WHITE, alpha=255):
    draw.text(xy, s, font=fnt, fill=fill + (int(alpha),))

def caption(base, tl, title, sub, anim=True):
    if not anim: tl = tl + 5
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ov.alpha_composite(bottom_grad())
    d = ImageDraw.Draw(ov)
    # small brand mark top-left
    ov.alpha_composite(lw(26), (56, 44))
    text(d, (100, 44), '457Corp', f('m', 18), alpha=230)
    p0 = ease_out((tl - 0.15) / 0.45)
    d.rounded_rectangle((60, H - 196, 60 + 44 * p0, H - 191), 2, fill=AMBER + (255,))
    p1 = ease_out((tl - 0.3) / 0.55)
    text(d, (58, H - 176 + 24 * (1 - p1)), title, f('m', 42), alpha=255 * p1)
    p2 = ease_out((tl - 0.5) / 0.55) if anim else ease_out((tl - 5 - 0.35) / 0.55)
    text(d, (60, H - 112 + 18 * (1 - p2)), sub, f('l', 23), alpha=225 * p2)
    base = base.convert('RGBA'); base.alpha_composite(ov)
    return base.convert('RGB')

# ---------- shot types ----------
def photo(name, dur, z=(1.0, 1.1), fx=(0.5, 0.5), fy=(0.5, 0.5), cap=None, anim=True):
    def draw(tl):
        p = tl / dur
        zz = z[0] + (z[1] - z[0]) * p
        im = cover(name, W, H, max(1.0, zz), fx[0] + (fx[1] - fx[0]) * p, fy[0] + (fy[1] - fy[0]) * p)
        if cap: im = caption(im, tl, *cap, anim=anim)
        return im
    return dict(dur=dur, draw=draw)

def panels(names, dur, cap=None, focus=None):
    n = len(names); gap = 8
    pw = (W - gap * (n - 1)) / n
    def draw(tl):
        im = Image.new('RGB', (W, H), NAVY)
        for i, nm in enumerate(names):
            x = round(i * (pw + gap)); w = round((i + 1) * (pw + gap) - gap) - x
            p = ease_out((tl - i * 0.12) / 0.7)
            zz = 1.0 + 0.06 * (tl / dur)
            fy = focus[i] if focus else 0.45
            pi = cover(nm, w, H, zz, 0.5, fy)
            y = round((1 - p) * 60)
            if p > 0:
                if p < 1:
                    pi = Image.blend(Image.new('RGB', pi.size, NAVY), pi, p)
                im.paste(pi.crop((0, 0, w, H - y)), (x, y))
        if cap: im = caption(im, tl, *cap)
        return im
    return dict(dur=dur, draw=draw)

def navy_bg():
    im = Image.new('RGB', (W, H), NAVY)
    # faint hexagon outline, brand motif
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    cx, cy, r = 1030, 360, 330
    pts = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in range(0, 360, 60)]
    d.polygon(pts, outline=(255, 255, 255, 22), width=2)
    r2 = 220; pts2 = [(cx + 60 + r2 * math.cos(math.radians(a)), cy + 40 + r2 * math.sin(math.radians(a))) for a in range(0, 360, 60)]
    d.polygon(pts2, outline=(245, 181, 79, 40), width=2)
    im = im.convert('RGBA'); im.alpha_composite(ov); return im

NAVY_BG = None
_x = np.linspace(0, 1, W)[None, :].repeat(H, 0)
_la = (np.clip(0.62 - _x, 0, 1) / 0.62) ** 1.2 * 0.62
_arr = np.zeros((H, W, 4), np.uint8); _arr[..., 0:3] = (5, 16, 28); _arr[..., 3] = (_la * 255).astype(np.uint8)
LEFT_GRAD = Image.fromarray(_arr, 'RGBA')
def intro(dur):
    def draw(tl):
        global NAVY_BG
        if NAVY_BG is None: NAVY_BG = navy_bg()
        im = NAVY_BG.copy(); d = ImageDraw.Draw(im)
        p = ease_out(tl / 0.8)
        chevrons(d, 120 + (1 - p) * -160, 300, 46, int(255 * p))
        pl = ease_out((tl - 0.35) / 0.7)
        if pl > 0:
            L = lw(96); L2 = L.copy(); L2.putalpha(L.split()[3].point(lambda v: int(v * pl)))
            im.alpha_composite(L2, (230, round(276 + (1 - pl) * 16)))
        p1 = ease_out((tl - 0.7) / 0.6)
        text(d, (232, 400 + 20 * (1 - p1)), 'CV. Empat Lima Tujuh', f('m', 50), alpha=255 * p1)
        p2 = ease_out((tl - 0.95) / 0.6)
        text(d, (234, 470 + 16 * (1 - p2)), 'General contractor and supplier', f('l', 26), fill=(200, 214, 228), alpha=255 * p2)
        return im.convert('RGB')
    return dict(dur=dur, draw=draw)

def thesis(name, dur):
    def draw(tl):
        im = cover(name, W, H, 1.0 + 0.1 * tl / dur, 0.55, 0.32).convert('RGBA')
        im.alpha_composite(bottom_grad(0.8, 0.15))
        im.alpha_composite(LEFT_GRAD)
        d = ImageDraw.Draw(im)
        im.alpha_composite(lw(26), (56, 44)); text(d, (100, 44), '457Corp', f('m', 18), alpha=230)
        for i, line in enumerate(['Tepat biaya.', 'Tepat mutu.', 'Tepat waktu.']):
            p = ease_out((tl - 0.2 - i * 0.28) / 0.6)
            text(d, (58, 330 + i * 80 + 30 * (1 - p)), line, f('m', 66), alpha=255 * p)
        p = ease_out((tl - 1.2) / 0.6)
        text(d, (62, 590 + 12 * (1 - p)), 'Kab. Batang, Jawa Tengah', f('l', 24), fill=(220, 228, 236), alpha=255 * p)
        return im.convert('RGB')
    return dict(dur=dur, draw=draw)

def stats(dur):
    def draw(tl):
        global NAVY_BG
        if NAVY_BG is None: NAVY_BG = navy_bg()
        im = NAVY_BG.copy(); d = ImageDraw.Draw(im)
        p = ease_out(tl / 0.5)
        d.rounded_rectangle((100, 150, 100 + 44 * p, 155), 2, fill=AMBER + (255,))
        text(d, (98, 172 + 14 * (1 - p)), 'Satu mitra untuk banyak pekerjaan', f('m', 40), alpha=255 * p)
        items = [(24, 'jenis pekerjaan'), (15, 'klien'), (5, 'dokumen legalitas')]
        for i, (n, lab) in enumerate(items):
            x = 100 + i * 360
            q = ease_out((tl - 0.35 - i * 0.15) / 0.6)
            c = ease_io((tl - 0.35 - i * 0.15) / 1.3)
            d.line((x, 330, x + 300 * q, 330), fill=(255, 255, 255, 60), width=1)
            text(d, (x - 4, 352 + 14 * (1 - q)), str(round(n * c)), f('l', 118), alpha=255 * q)
            text(d, (x, 512 + 10 * (1 - q)), lab, f('r', 24), fill=(184, 199, 214), alpha=255 * q)
        return im.convert('RGB')
    return dict(dur=dur, draw=draw)

def outro(dur):
    def draw(tl):
        global NAVY_BG
        if NAVY_BG is None: NAVY_BG = navy_bg()
        im = NAVY_BG.copy(); d = ImageDraw.Draw(im)
        p = ease_out(tl / 0.7)
        L = lw(70); L2 = L.copy(); L2.putalpha(L.split()[3].point(lambda v: int(v * p)))
        im.alpha_composite(L2, (100, 150))
        text(d, (100, 248 + 14 * (1 - p)), 'CV. Empat Lima Tujuh', f('m', 44), alpha=255 * p)
        p2 = ease_out((tl - 0.35) / 0.6)
        text(d, (102, 312 + 12 * (1 - p2)), 'Tepat biaya, mutu, dan waktu.', f('l', 26), fill=(200, 214, 228), alpha=255 * p2)
        p3 = ease_out((tl - 0.7) / 0.6)
        y = 420 + 14 * (1 - p3)
        d.rounded_rectangle((100, y, 100 + 300, y + 58), 29, fill=AMBER + (int(255 * p3),))
        text(d, (134, y + 13), 'Minta penawaran', f('m', 24), fill=NAVY, alpha=255 * p3)
        p4 = ease_out((tl - 0.95) / 0.6)
        text(d, (100, 520 + 10 * (1 - p4)), '+62 858-7958-2495  (Rangga Yudhi)', f('r', 24), alpha=240 * p4)
        text(d, (100, 560 + 10 * (1 - p4)), 'cvempatlimatujuh@gmail.com', f('r', 24), alpha=240 * p4)
        chevrons(d, 1080 - (1 - p) * 60, 600, 40, int(255 * p))
        return im.convert('RGB')
    return dict(dur=dur, draw=draw)

def teaser_shots():
    return [
        intro(3.2),
        thesis('hero-pju.webp', 3.8),
        photo('p-guardrail-1.webp', 2.9, (1.0, 1.1), (0.45, 0.55), (0.5, 0.5), ('Jalan & fasilitas jalan', 'Guardrail, rambu, reflektor, dan MCB')),
        photo('p-perkerasan-beton-1.webp', 2.7, (1.08, 1.0), (0.5, 0.5), (0.45, 0.5), ('Jalan & fasilitas jalan', 'Perkerasan beton dan pengecatan struktur'), anim=False),
        photo('p-u-ditch-1.webp', 2.9, (1.0, 1.1), (0.4, 0.55), (0.55, 0.5), ('Drainase & penanganan tanah', 'Saluran U-ditch, drainase beton, bronjong')),
        photo('p-penanganan-longsor-1.webp', 2.7, (1.1, 1.0), (0.5, 0.5), (0.5, 0.5), ('Drainase & penanganan tanah', 'Penanganan longsor'), anim=False),
        panels(['p-pemasangan-fo-1.webp', 'p-instalasi-fo-1.webp'], 3.1, ('Jaringan fiber optik', 'Pemasangan jalur dan pengukuran OTDR'), focus=[0.5, 0.42]),
        panels(['p-mekanikal-elektrikal-1.webp', 'p-elektrikal-2.webp', 'p-plumbing-1.webp'], 3.3, ('Mekanikal, elektrikal & plumbing', 'Genset, panel listrik, dan pipa HDPE'), focus=[0.4, 0.4, 0.45]),
        stats(3.4),
        outro(4.2),
    ]

def hero_shots():
    return [
        photo('hero-pju.webp', 3.6, (1.0, 1.1), (0.55, 0.6), (0.35, 0.3)),
        photo('p-guardrail-1.webp', 3.2, (1.0, 1.09), (0.45, 0.55), (0.5, 0.5)),
        photo('p-u-ditch-1.webp', 3.2, (1.1, 1.0), (0.45, 0.5), (0.5, 0.5)),
        photo('p-perkerasan-beton-1.webp', 3.2, (1.0, 1.08), (0.5, 0.5), (0.5, 0.45)),
        photo('p-pengecatan-guardrail-1.webp', 3.2, (1.08, 1.0), (0.5, 0.45), (0.5, 0.5)),
        photo('p-drainase-beton-1.webp', 3.2, (1.0, 1.08), (0.5, 0.5), (0.5, 0.5)),
    ]

def timeline(shots, loop=False):
    t = 0; starts = []
    for i, s in enumerate(shots):
        starts.append(t); t += s['dur'] - (XF if i < len(shots) - 1 or loop else 0)
    total = starts[-1] + shots[-1]['dur'] if loop else t
    def compose(T):
        act = [(i, T - starts[i]) for i in range(len(shots)) if starts[i] <= T < starts[i] + shots[i]['dur'] + 1e-9]
        if loop and T >= total - 1e-9 - 0 and False: pass
        if loop and T > starts[-1] + shots[-1]['dur'] - XF:
            a = shots[-1]['draw'](T - starts[-1]); b = shots[0]['draw'](T - (starts[-1] + shots[-1]['dur'] - XF) - XF)
            return Image.blend(a, b, ease_io((T - (starts[-1] + shots[-1]['dur'] - XF)) / XF))
        if len(act) == 1: return shots[act[0][0]]['draw'](act[0][1])
        (i, ti), (j, tj) = act[0], act[-1]
        a = shots[i]['draw'](ti); b = shots[j]['draw'](tj)
        return Image.blend(a, b, ease_io(tj / XF))
    return starts, total, compose

def render(shots, name, loop=False, crf=23):
    starts, total, compose = timeline(shots, loop)
    N = round(total * FPS)
    bounds = [round(s * FPS) for s in starts] + [N]
    parts = []
    for k in range(len(shots)):
        a, b = bounds[k], bounds[k + 1]
        if b <= a: continue
        part = os.path.join(OUT, f'{name}_part{k:02d}.mp4'); tmp = part[:-4] + '.tmp.mp4'
        p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                              '-c:v', 'libx264', '-preset', 'veryfast', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-g', '60', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
        for fi in range(a, b):
            p.stdin.write(compose(fi / FPS).tobytes())
        p.stdin.close(); assert p.wait() == 0
        os.replace(tmp, part); parts.append(part)
    lst = os.path.join(OUT, f'{name}_list.txt')
    open(lst, 'w').write(''.join(f"file '{os.path.basename(x)}'\n" for x in parts))
    final = os.path.join(OUT, f'{name}.mp4'); tmp = final[:-4] + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', tmp], check=True, cwd=OUT)
    os.replace(tmp, final)
    print(name, round(total, 2), 's', os.path.getsize(final) // 1024, 'KB')

if MODE == 'frames':
    starts, total, compose = timeline(teaser_shots())
    for k, T in enumerate([2.4, starts[1] + 2.6, starts[2] + 1.6, starts[6] + 1.8, starts[7] + 2.0, starts[8] + 2.5, starts[9] + 2.5, starts[3] + 0.25]):
        compose(T).save(os.path.join(OUT, f'frame{k}.jpg'), quality=90)
    print('teaser total', total)
elif MODE == 'teaser':
    render(teaser_shots(), 'teaser', crf=23)
elif MODE == 'hero':
    render(hero_shots(), 'hero-loop', loop=True, crf=27)
