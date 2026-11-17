# CV. Empat Lima Tujuh (457Corp)

Website company profile CV. Empat Lima Tujuh, general contractor and supplier di Kab. Batang, Jawa Tengah.

- Website utama: https://457-gold.vercel.app/
- Halaman admin: https://457-gold.vercel.app/admin

## Isi website

| Halaman | Alamat | Isi |
|---|---|---|
| Beranda | `/` | Video latar, angka ringkas, video teaser, ringkasan layanan, proyek terbaru, klien |
| Tentang | `/tentang` | Profil, visi, misi, komitmen kerja, klien |
| Layanan | `/layanan` | Empat kelompok pekerjaan dan supplier, tersambung ke portofolio |
| Portofolio | `/portofolio` | Semua proyek dengan filter kategori dan penampil foto |
| Legalitas | `/legalitas` | Akta pendirian, NIB, SBU, SKT, NPWP |
| Kontak | `/kontak` | Kontak dan form minta penawaran |
| Admin | `/admin` | Pesan masuk, ubah portofolio, klien, dan kontak |

Form di halaman Kontak mengirim permintaan ke server. Permintaan disimpan, muncul di halaman admin, dan (bila diaktifkan) dikirim ke email perusahaan. Bila server tidak bisa dihubungi, pengunjung diarahkan mengirim lewat WhatsApp atau email.

## Struktur folder

```
├── index.html, tentang.html, layanan.html, portofolio.html,
│   legalitas.html, kontak.html, 404.html     halaman publik (hasil tools/build_pages.py)
├── admin.html                                halaman admin
├── api/                                      server (Vercel Functions, Node.js, tanpa dependensi)
│   ├── _lib/core.js                          penyimpanan, sesi admin, validasi, email
│   ├── content.js                            ambil/simpan konten
│   ├── lead.js                               terima form penawaran
│   ├── leads.js                              daftar, ubah status, hapus pesan (admin)
│   ├── login.js, me.js                       masuk/keluar admin dan status server
│   ├── upload.js, img.js                     unggah dan tampilkan foto dari admin
├── data/content.json                         konten bawaan (cadangan sebelum admin menyimpan)
├── css/  js/  img/  media/                   tampilan, skrip, foto, video
├── tools/                                    skrip pengembangan (tidak ikut di-deploy)
│   ├── build_pages.py                        menyusun halaman dari potongan bersama
│   ├── dev-server.js                         server lokal lengkap dengan API
│   ├── teaser.py, music.py                   membuat ulang video teaser dan musiknya
├── vercel.json                               alamat tanpa .html, cache, header keamanan
└── .vercelignore
```

## Menyiapkan server di Vercel

Project Vercel `457` sudah tersambung ke repository ini. Setiap push ke `main` otomatis di-deploy. Agar form dan admin berfungsi, lakukan sekali:

### 1. Hubungkan penyimpanan (wajib)

1. Buka https://vercel.com, pilih project **457**, lalu tab **Storage**.
2. Klik **Create Database**, pilih **Upstash for Redis**, paket **Free**, lalu **Create**.
3. Pada langkah **Connect Project**, pilih project **457** untuk semua environment.

Vercel otomatis menambahkan `KV_REST_API_URL` dan `KV_REST_API_TOKEN`.

### 2. Atur kata sandi admin (wajib)

Di **Settings > Environment Variables**, tambahkan:

| Nama | Isi |
|---|---|
| `ADMIN_PASSWORD` | Kata sandi admin, minimal 8 karakter. Simpan baik-baik. |

### 3. Notifikasi email (opsional)

1. Daftar di https://resend.com memakai email **cvempatlimatujuh@gmail.com**, lalu buat API key.
2. Tambahkan di Environment Variables:

| Nama | Isi |
|---|---|
| `RESEND_API_KEY` | API key dari Resend |
| `MAIL_TO` | (opsional) email penerima; bawaannya email di halaman Kontak |
| `MAIL_FROM` | (opsional) pengirim, mis. `Website 457Corp <noreply@domainanda.co.id>` setelah domain diverifikasi di Resend |

Tanpa domain sendiri, Resend hanya bisa mengirim ke email yang dipakai mendaftar.

### 4. Deploy ulang

Setelah menambah variabel, buka tab **Deployments**, klik titik tiga pada deployment teratas, lalu **Redeploy**.

## Memakai halaman admin

Buka `/admin`, masukkan `ADMIN_PASSWORD`.

- **Pesan masuk**: semua permintaan penawaran. Ubah status (Baru, Dihubungi, Selesai), balas lewat WhatsApp, hapus, atau unduh CSV.
- **Portofolio**: tambah, ubah, hapus, dan urutkan proyek. Foto dikecilkan otomatis di browser sebelum diunggah. Proyek pertama tampil paling besar.
- **Klien**: tambah klien dengan atau tanpa logo, urutkan, hapus.
- **Kontak**: nama admin, telepon, WhatsApp, email, alamat, link Google Maps.

Perubahan tampil di website dalam sekitar 15 detik.

## Menjalankan di komputer sendiri

Butuh Node.js 18 atau lebih baru.

```bash
node tools/dev-server.js
```

Buka http://localhost:3000. Data disimpan di memori dan hilang saat server dimatikan. Kata sandi admin lokal: `admin12345` (ubah dengan `ADMIN_PASSWORD=... node tools/dev-server.js`).

## Mengubah tampilan halaman

Header, footer, dan isi tetap tiap halaman disusun oleh `tools/build_pages.py`. Ubah file itu, lalu jalankan:

```bash
python tools/build_pages.py
```

Gaya ada di `css/style.css` (warna dan font di blok `:root`), perilaku halaman di `js/site.js`.

## GitHub Pages

Repository ini juga tampil di https://aik-prog.github.io/457/, tapi GitHub Pages tidak menjalankan server. Di sana konten memakai `data/content.json`, form beralih ke WhatsApp, dan admin tidak bisa dipakai. Gunakan alamat Vercel sebagai website utama.

## Membuat ulang video dan musik (opsional)

Kebutuhan: Python 3.9+, ffmpeg, dan font Poppins (Light, Regular, Medium) di `tools/fonts/`.

```bash
pip install -r tools/requirements.txt
python tools/teaser.py teaser
python tools/teaser.py hero
python tools/music.py tools/output/music.wav
ffmpeg -i tools/output/teaser.mp4 -i tools/output/music.wav -map 0:v -map 1:a \
  -c:v copy -af "volume=-3.2dB,alimiter=limit=0.89" -c:a aac -b:a 160k \
  -shortest -movflags +faststart media/teaser.mp4
```

## Hak cipta dan lisensi

- Musik di `media/teaser.mp4` dan `media/musik-teaser-457corp.mp3` dibuat orisinal dengan sintesis suara (`tools/music.py`), tanpa sampel atau lagu pihak lain.
- Font Poppins dimuat dari Google Fonts dengan lisensi SIL Open Font License.
- Logo, foto proyek, dan dokumen legalitas milik CV. Empat Lima Tujuh. Logo klien milik masing-masing perusahaan.
- Dokumen legalitas (termasuk NPWP dan NIB) terlihat publik di website dan repository.
