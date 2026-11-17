# CV. Empat Lima Tujuh (457Corp)

Website company profile CV. Empat Lima Tujuh, general contractor and supplier di Kab. Batang, Jawa Tengah.

Website statis: HTML, CSS, dan JavaScript biasa, tanpa framework dan tanpa proses build. Bisa langsung dipasang di GitHub Pages, Netlify, Vercel, atau hosting biasa.

## Isi website

- Beranda layar penuh dengan video latar proyek
- Angka ringkas: 24 jenis pekerjaan, 15 klien, 5 dokumen legalitas
- Video teaser 28 detik dengan musik orisinal
- Tentang kami, visi, misi, dan lima komitmen kerja
- Layanan dalam bentuk akordeon, tersambung ke filter portofolio
- Portofolio 24 pekerjaan dengan filter kategori dan penampil foto
- Legalitas: Akta pendirian, NIB, SBU, SKT, NPWP
- Logo klien berjalan
- Form minta penawaran yang menyusun pesan otomatis ke WhatsApp atau email
- Halaman `simulasi.html`: demo otomatis alur calon klien di bingkai desktop, tablet, dan HP

## Struktur folder

```
cv-empat-lima-tujuh/
├── index.html          halaman utama
├── simulasi.html       halaman demo/simulasi
├── css/
│   ├── style.css       tampilan halaman utama
│   └── simulasi.css    tampilan halaman simulasi
├── js/
│   ├── main.js         data layanan, portofolio, klien, form, animasi
│   └── simulasi.js     skenario simulasi
├── img/                logo, foto proyek, dokumen legal, logo klien
├── media/
│   ├── hero-loop.mp4   video latar beranda (tanpa suara)
│   ├── teaser.mp4      video teaser dengan musik
│   └── musik-teaser-457corp.mp3
├── tools/              skrip untuk membuat ulang video dan musik (opsional)
├── .nojekyll           supaya GitHub Pages tidak memproses ulang file
└── .gitignore
```

## Menjalankan di komputer sendiri

Buka terminal di folder ini, lalu jalankan salah satu:

```bash
python -m http.server 8000
# atau
npx serve .
```

Lalu buka http://localhost:8000. Halaman simulasi ada di http://localhost:8000/simulasi.html.

Sebaiknya pakai server lokal seperti di atas, bukan klik dua kali `index.html`, supaya video dan halaman simulasi berjalan normal.

## Upload ke GitHub

### Cara 1: lewat terminal (disarankan)

1. Buat repository baru di https://github.com/new, misalnya bernama `cv-empat-lima-tujuh`. Jangan centang "Add a README".
2. Jalankan di folder ini:

```bash
git init
git add .
git commit -m "Website company profile CV. Empat Lima Tujuh"
git branch -M main
git remote add origin https://github.com/USERNAME/cv-empat-lima-tujuh.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

### Cara 2: lewat browser

Di halaman repository baru, klik **uploading an existing file**, lalu seret semua isi folder ini. Upload lewat browser dibatasi 100 file per kali, jadi upload dalam dua tahap: pertama semua file dan folder kecuali `img/`, lalu isi folder `img/`.

Catatan: file yang namanya diawali titik (`.nojekyll`, `.gitignore`) kadang tersembunyi di Windows Explorer atau Finder. Keduanya tidak wajib, website tetap jalan tanpa itu.

## Aktifkan GitHub Pages

1. Buka repository di GitHub, masuk **Settings** lalu **Pages**.
2. Di **Build and deployment**, pilih **Source: Deploy from a branch**.
3. Pilih branch **main** dan folder **/ (root)**, lalu **Save**.
4. Tunggu 1 sampai 2 menit. Website akan tampil di:

```
https://USERNAME.github.io/cv-empat-lima-tujuh/
```

Simulasi: `https://USERNAME.github.io/cv-empat-lima-tujuh/simulasi.html`

Untuk akun GitHub gratis, GitHub Pages hanya bisa dipakai dari repository **public**.

### Memakai domain sendiri (opsional)

Kalau punya domain, misalnya `457corp.co.id`:

1. Buat file `CNAME` di folder utama berisi satu baris: `457corp.co.id`
2. Di pengaturan DNS domain, tambahkan record `CNAME` dari `www` ke `USERNAME.github.io`, atau record `A` ke alamat IP GitHub Pages (lihat https://docs.github.com/pages).
3. Isi domain yang sama di **Settings > Pages > Custom domain**, lalu centang **Enforce HTTPS**.

## Mengubah isi website

| Yang ingin diubah | Tempatnya |
|---|---|
| Nomor WhatsApp dan email tujuan form | `js/main.js`, variabel `WA` dan `MAIL` di bagian atas |
| Alamat, telepon, email yang tampil | `index.html`, bagian header, `#kontak`, dan footer |
| Kelompok layanan dan deskripsinya | `js/main.js`, objek `CATS` |
| Daftar portofolio | `js/main.js`, array `P` (format: id foto, judul, kategori, jumlah foto) |
| Dokumen legalitas | `js/main.js`, array `DOCS` |
| Daftar klien | `js/main.js`, array `CLIENTS` |
| Warna dan font | `css/style.css`, blok `:root` di bagian paling atas |
| Teks beranda, tentang, visi, misi | `index.html` |
| Tombol "Buka simulasi website" | `js/main.js`, ubah `TAMPILKAN_TOMBOL_SIMULASI` menjadi `false` |

### Menambah foto portofolio

Foto portofolio memakai dua ukuran dengan pola nama:

- `img/p-NAMA-1.webp` foto besar (sisi terpanjang sekitar 1400 px)
- `img/p-NAMA-1-t.webp` foto kecil untuk grid (sekitar 640 px)

Untuk proyek dengan beberapa foto, lanjutkan nomornya: `p-NAMA-2.webp`, `p-NAMA-2-t.webp`, dan seterusnya. Lalu tambahkan satu baris di array `P` pada `js/main.js`, misalnya:

```js
['pagar-gudang', 'Pek. Pagar Gudang', 'jalan', 2],
```

Kategori yang tersedia: `jalan`, `air`, `fo`, `mep`.

## Tampilan saat dibagikan

Saat link dibagikan di WhatsApp atau media sosial, gambar pratinjau diambil dari `img/og-image.jpg`. Setelah website online, ganti isi `og:image` di `index.html` dengan alamat lengkap, misalnya `https://USERNAME.github.io/cv-empat-lima-tujuh/img/og-image.jpg`, karena sebagian aplikasi hanya membaca alamat lengkap.

## Membuat ulang video dan musik (opsional)

Folder `tools/` berisi skrip yang dipakai untuk membuat video teaser dan musiknya. Tidak dibutuhkan untuk menjalankan website.

Kebutuhan: Python 3.9+, ffmpeg, dan font Poppins (Light, Regular, Medium) dari https://fonts.google.com/specimen/Poppins yang disimpan di `tools/fonts/`.

```bash
pip install -r tools/requirements.txt

python tools/teaser.py teaser            # tools/output/teaser.mp4 (tanpa suara)
python tools/teaser.py hero              # tools/output/hero-loop.mp4
python tools/music.py tools/output/music.wav

# gabungkan video dan musik
ffmpeg -i tools/output/teaser.mp4 -i tools/output/music.wav -map 0:v -map 1:a \
  -c:v copy -af "volume=-3.2dB,alimiter=limit=0.89" -c:a aac -b:a 160k \
  -shortest -movflags +faststart media/teaser.mp4
```

Teks dan foto di video bisa diubah di fungsi `teaser_shots()` pada `tools/teaser.py`.

## Hak cipta dan lisensi

- Musik di `media/teaser.mp4` dan `media/musik-teaser-457corp.mp3` dibuat orisinal dengan sintesis suara (`tools/music.py`), tanpa sampel atau lagu pihak lain. Bebas dipakai untuk keperluan CV. Empat Lima Tujuh.
- Font Poppins dimuat dari Google Fonts dengan lisensi SIL Open Font License.
- Logo, foto proyek, dan dokumen legalitas adalah milik CV. Empat Lima Tujuh. Logo klien adalah milik masing-masing perusahaan.
- Dokumen legalitas (termasuk NPWP dan NIB) ikut terlihat publik bila repository dan website dibuka untuk umum. Pertimbangkan memberi watermark atau memakai versi resolusi rendah bila perlu.
