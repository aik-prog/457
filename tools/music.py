"""Musik latar orisinal untuk video teaser 457Corp (27,7 detik).
Seluruh suara dibuat dengan sintesis, tanpa sampel atau lagu pihak lain.

Pemakaian (dari folder utama repo):
    python tools/music.py tools/output/music.wav

Butuh: Python 3.9+, numpy, scipy.
"""
import sys
import numpy as np
import scipy.signal as ss
from scipy.io import wavfile

SR = 44100
T = 27.7
N = int(SR * T)
rng = np.random.default_rng(457)
BEAT = 0.52            # ~115 BPM: 10 bars fit exactly between the drop (2.7 s) and the outro (23.5 s)
BAR = 4 * BEAT
DROP, OUTRO = 2.7, 23.5
CUTS = [6.0, 8.4, 10.6, 13.0, 15.2, 17.8, 20.6]   # scene changes in the teaser

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR

class Bus:
    def __init__(self): self.x = np.zeros((2, N))
    def add(self, sig, t, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N or i + len(sig) <= 0: return
        s = sig
        if i < 0: s = s[-i:]; i = 0
        j = min(N, i + len(s))
        a = (pan + 1) * np.pi / 4
        self.x[0, i:j] += s[:j - i] * gain * np.cos(a) * 1.414
        self.x[1, i:j] += s[:j - i] * gain * np.sin(a) * 1.414

drums, bass, pad, arp, fx = Bus(), Bus(), Bus(), Bus(), Bus()

# ---------- instruments ----------
def kick():
    t = tt(0.45)
    f = 44 + 120 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s += 0.25 * rng.standard_normal(len(t)) * np.exp(-t * 400)
    return s

def clap():
    t = tt(0.25)
    n = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for k, o in enumerate([0, 0.011, 0.022]):
        env += (t >= o) * np.exp(-np.maximum(t - o, 0) * (90 if k < 2 else 18))
    b, a = ss.butter(2, [900 / (SR / 2), 4200 / (SR / 2)], 'band')
    return ss.lfilter(b, a, n * env)

def hat(open_=False):
    t = tt(0.22 if open_ else 0.07)
    n = rng.standard_normal(len(t))
    b, a = ss.butter(2, 7500 / (SR / 2), 'high')
    return ss.lfilter(b, a, n) * np.exp(-t * (16 if open_ else 70))

def bass_note(m, d=0.25):
    t = tt(d)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    env = (1 - np.exp(-t * 120)) * np.exp(-t * 5)
    env[-200:] *= np.linspace(1, 0, 200)
    return s * env

def pad_chord(notes, d, att=0.35, rel=0.7):
    t = tt(d + rel)
    out = np.zeros((2, len(t)))
    for m in notes:
        for k, det in enumerate((-0.07, 0.0, 0.07)):
            f = hz(m) * 2 ** (det / 12)
            v = ss.sawtooth(2 * np.pi * f * t + rng.uniform(0, 6.28))
            ch = 0 if k == 0 else (1 if k == 2 else None)
            if ch is None: out += v * 0.5
            else: out[ch] += v * 0.8
    b, a = ss.butter(2, 1700 / (SR / 2))
    out = ss.lfilter(b, a, out, axis=1)
    env = np.minimum(1, t / att) * np.where(t > d, np.exp(-(t - d) * 5.5), 1.0)
    return out * env / (len(notes) * 2.2)

def pluck(m, d=0.42):
    t = tt(d)
    f = hz(m)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.5 * np.sin(4 * np.pi * f * t) * np.exp(-t * 14)
         + 0.22 * np.sin(6 * np.pi * f * t) * np.exp(-t * 22) + 0.1 * np.sin(8 * np.pi * f * t) * np.exp(-t * 30))
    s *= (1 - np.exp(-t * 600))
    return s

def bell(m, d=2.6):
    t = tt(d)
    f = hz(m)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3.2)
         + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6))
    return s * (1 - np.exp(-t * 900))

def shaped_noise(d, centers, widths, gains):
    """noise whose spectrum follows a moving band; centers/widths/gains are callables of u in [0,1]"""
    n = rng.standard_normal(int(d * SR))
    f, tf, Z = ss.stft(n, SR, nperseg=1024)
    u = np.clip(tf / d, 0, 1)
    c, w, g = centers(u), widths(u), gains(u)
    M = np.exp(-0.5 * ((f[:, None] - c[None, :]) / w[None, :]) ** 2) * g[None, :]
    _, y = ss.istft(Z * M, SR, nperseg=1024)
    y = y[:len(n)]
    return y / (np.abs(y).max() + 1e-9)

def whoosh(d=0.7):
    return shaped_noise(d, lambda u: 500 + 4200 * np.sin(np.pi * u) ** 1.5, lambda u: 400 + 1800 * np.sin(np.pi * u),
                        lambda u: np.sin(np.pi * u) ** 2)

def riser(d):
    s = shaped_noise(d, lambda u: 300 + 7000 * u ** 2, lambda u: 300 + 2500 * u, lambda u: u ** 2.2)
    t = tt(d)
    sweep = np.sin(2 * np.pi * np.cumsum(180 * 2 ** (2.6 * t / d)) / SR) * (t / d) ** 3
    return 0.8 * s + 0.25 * sweep[:len(s)]

def impact(big=True):
    t = tt(2.4 if big else 1.4)
    f = 32 + 40 * np.exp(-t * 6)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (1.8 if big else 3.2))
    n = rng.standard_normal(len(t))
    b, a = ss.butter(2, 2500 / (SR / 2))
    burst = ss.lfilter(b, a, n) * np.exp(-t * 9)
    return boom + 0.45 * burst

# ---------- arrangement ----------
CH = {  # pad voicing, bass root, arp tones
    'C':  ([60, 64, 67, 72], 36, [72, 76, 79, 84]),
    'G':  ([59, 62, 67, 71], 43, [71, 74, 79, 83]),
    'Am': ([57, 60, 64, 69], 45, [69, 72, 76, 81]),
    'F':  ([57, 60, 65, 69], 41, [69, 72, 77, 81]),
    'Dm': ([57, 62, 65, 69], 38, [69, 74, 77, 81]),
    'Gs': ([60, 62, 67, 72], 43, [72, 74, 79, 84]),
}
PROG = ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'Gs']

# intro: suspended Am(add9) swell, soft logo hit, riser into the drop
pad.add(pad_chord([57, 64, 71, 72], DROP + 0.2, att=1.6, rel=0.5)[0], 0.0, 0.55, -0.2)
pad.add(pad_chord([57, 64, 71, 72], DROP + 0.2, att=1.6, rel=0.5)[1], 0.0, 0.55, 0.2)
fx.add(impact(False), 0.36, 0.35)
for k, m in enumerate([81, 84, 88]):
    fx.add(bell(m, 2.2), 0.40 + k * 0.09, 0.10, (-0.4, 0.0, 0.4)[k])
fx.add(riser(1.6), DROP - 1.6, 0.42)
fx.add(impact(True), DROP, 0.55)

ARP = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 1, 2]
for i, name in enumerate(PROG):
    bt = DROP + i * BAR
    vox, root, tones = CH[name]
    pc = pad_chord(vox, BAR, att=0.25, rel=0.6)
    pad.add(pc[0], bt, 0.5, -0.5); pad.add(pc[1], bt, 0.5, 0.5)
    for b in range(4):
        t0 = bt + b * BEAT
        drums.add(kick(), t0, 0.95)
        if i >= 2 and b in (1, 3): drums.add(clap(), t0, 0.30, 0.05)
        drums.add(hat(open_=(i >= 4 and b == 3)), t0 + BEAT / 2, 0.16 if i >= 4 else 0.12, 0.25)
        if i >= 4:
            drums.add(hat(), t0 + BEAT / 4, 0.06, -0.3); drums.add(hat(), t0 + 3 * BEAT / 4, 0.06, -0.3)
        for e in range(2):
            bass.add(bass_note(root + (12 if (i >= 4 and e == 1 and b % 2 == 1) else 0)), t0 + e * BEAT / 2, 0.55 if i else 0.4)
    if i >= 1:
        for s16 in range(16):
            arp.add(pluck(tones[ARP[s16]]), bt + s16 * BEAT / 4, 0.16 if i < 4 else 0.2, (-0.35, 0.35)[s16 % 2])
    if i == 9:  # build into the outro: clap roll + riser
        for k in range(8):
            drums.add(clap(), bt + 2 * BEAT + k * BEAT / 4, 0.12 + 0.03 * k, 0.0)
        fx.add(riser(1.5), OUTRO - 1.5, 0.45)

for c in CUTS:
    fx.add(whoosh(0.7), c - 0.42, 0.16, 0.0)

# outro: big hit, open C chord, bell arpeggio, held bass
fx.add(impact(True), OUTRO, 0.7)
oc = pad_chord([48, 55, 60, 64, 67, 72], 2.6, att=0.05, rel=1.6)
pad.add(oc[0], OUTRO, 0.75, -0.4); pad.add(oc[1], OUTRO, 0.75, 0.4)
bass.add(bass_note(36, 3.2) * np.exp(-tt(3.2) * 0.8), OUTRO, 0.6)
for k, m in enumerate([72, 76, 79, 84, 88]):
    fx.add(bell(m, 3.4), OUTRO + 0.12 + k * 0.26, 0.13, (-0.5, -0.2, 0.1, 0.4, 0.0)[k])

# ---------- mix ----------
def duck(x):
    env = np.ones(N)
    for i in range(10):
        for b in range(4):
            s = int((DROP + i * BAR + b * BEAT) * SR)
            k = np.arange(int(0.3 * SR))
            seg = 1 - 0.45 * np.exp(-k / SR * 10)
            e = min(N, s + len(k)); env[s:e] = np.minimum(env[s:e], seg[:e - s])
    return x * env

def ir(rt=1.7, pre=0.02):
    t = tt(rt * 1.4)
    out = rng.standard_normal((2, len(t))) * np.exp(-t * 6.9 / rt)
    b, a = ss.butter(1, 5000 / (SR / 2))
    out = ss.lfilter(b, a, out, axis=1)
    out = np.concatenate([np.zeros((2, int(pre * SR))), out], axis=1)
    return out / np.sqrt((out ** 2).sum(axis=1, keepdims=True))

def reverb(x, wet, rt=1.7):
    h = ir(rt)
    y = np.stack([ss.fftconvolve(x[c], h[c])[:N] for c in range(2)])
    return x + wet * y

def delay(x, dt=0.39, fb=0.35, mix=0.28):
    d = int(dt * SR); y = x.copy(); tap = x.copy()
    for k in range(4):
        tap = np.roll(tap, d, axis=1); tap[:, :d] = 0; tap = tap[::-1] * fb  # ping-pong
        y += mix * tap
    return y

padm = reverb(duck(pad.x), 0.35)
arpm = reverb(delay(duck(arp.x)), 0.30)
fxm = reverb(fx.x, 0.45, rt=2.2)
mix = 0.95 * drums.x + 0.75 * duck(bass.x) + 0.8 * padm + 0.75 * arpm + 0.9 * fxm

b, a = ss.butter(2, 28 / (SR / 2), 'high')
mix = ss.lfilter(b, a, mix, axis=1)
mix /= np.abs(mix).max()
mix = np.tanh(1.2 * mix) / np.tanh(1.2)          # gentle saturation / glue
t = np.arange(N) / SR
fade = np.clip((T - t) / 1.6, 0, 1) ** 1.5 * np.clip(t / 0.03, 0, 1)
mix *= fade
mix *= 0.89 / np.abs(mix).max()
assert np.isfinite(mix).all()
out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
rms = 20 * np.log10(np.sqrt((mix ** 2).mean()))
print('tersimpan:', out, '| rms dBFS', round(rms, 1))
