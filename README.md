# 💍 Undangan Digital Pernikahan
### Panduan Setup & Deploy ke Netlify

---

## 📁 Struktur Project

```
undangan/
├── index.html                  ← Halaman utama
├── netlify.toml                ← Konfigurasi Netlify
├── google-apps-script.js       ← Script Google Sheets backend
├── README.md                   ← Panduan ini
│
├── assets/
│   ├── css/
│   │   └── style.css           ← Semua styling
│   ├── js/
│   │   ├── main.js             ← Animasi, parallax, cursor, countdown
│   │   └── rsvp.js             ← Integrasi Google Sheets
│   ├── svg/
│   │   ├── ornamen-sudut.svg   ← Ornamen sudut (bisa diganti dari GPT)
│   │   ├── kembang-garland.svg ← Garland melati
│   │   ├── ornamen-sisi.svg    ← Ornamen sisi vertikal
│   │   └── divider.svg         ← Garis pemisah
│   ├── img/                    ← ⚙️ TARUH FOTO DI SINI
│   │   ├── foto-pria.jpg
│   │   ├── foto-wanita.jpg
│   │   ├── foto1.jpg … foto5.jpg
│   │   └── og-image.jpg        ← Thumbnail share WA/sosmed (1200×630px)
│   └── music/
│       └── musik-nikah.mp3     ← ⚙️ TARUH FILE MUSIK DI SINI
```

---

## ⚙️ YANG HARUS DIGANTI (Cari tanda ⚙️ di index.html)

### 1. Nama & Tanggal
File: `index.html`
- Nama mempelai pria: `Ahmad Rifai` → nama asli
- Nama mempelai wanita: `[Nama Pasangan]` → nama asli
- Tanggal: `Ahad, 1 Januari 2026` → tanggal asli
- Data orang tua: `[Nama Ayah]`, `[Nama Ibu]`

File: `assets/js/main.js` baris 10:
```js
const WEDDING_DATE = new Date('2026-01-01T08:00:00');
// Ganti format: 'YYYY-MM-DDTHH:MM:SS'
```

### 2. Lokasi Acara
File: `index.html` — section EVENT
- Nama & alamat tempat akad
- Nama & alamat tempat resepsi
- Link Google Maps embed (ganti `src` di `<iframe>`)

**Cara ambil embed Maps:**
1. Buka Google Maps → cari lokasi
2. Klik Share → Embed a map
3. Copy kode `<iframe>` → paste src-nya

### 3. Rekening & Alamat Hadiah
File: `index.html` — section GIFT
- Nama bank, nama pemilik, nomor rekening

### 4. Foto Pengantin
Taruh file di `assets/img/` lalu di `index.html` ganti:
```html
<!-- Dari ini: -->
<div class="placeholder">🤵</div>

<!-- Jadi ini: -->
<img src="assets/img/foto-pria.jpg" alt="Mempelai Pria">
```
Lakukan hal sama untuk foto wanita dan 5 foto galeri.

### 5. Musik Latar
Taruh file `.mp3` ke `assets/music/musik-nikah.mp3`
(atau ganti path di `index.html` bagian `<audio>`)

### 6. OG Image (thumbnail share)
Buat gambar 1200×630px dengan nama pengantin → simpan sebagai `assets/img/og-image.jpg`

---

## 🔗 Setup Google Sheets (RSVP & Data Tamu)

### Langkah 1 — Buat Spreadsheet
1. Buka [sheets.google.com](https://sheets.google.com)
2. Buat spreadsheet baru → beri nama **"RSVP Undangan [Nama]"**
3. Buat 3 tab sheet:
   - `RSVP` — otomatis terisi dari form website
   - `Tamu` — input manual daftar 300 tamu
   - `Dashboard` — ringkasan otomatis

### Langkah 2 — Pasang Apps Script
1. Klik **Extensions → Apps Script**
2. Hapus semua kode yang ada
3. Copy-paste seluruh isi file `google-apps-script.js`
4. Klik **Save** (Ctrl+S)

### Langkah 3 — Deploy Web App
1. Klik **Deploy → New deployment**
2. Pilih type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Klik **Deploy** → authorize kalau diminta
6. **Copy URL yang muncul** (formatnya: `https://script.google.com/macros/s/ABC.../exec`)

### Langkah 4 — Pasang URL ke Website
File: `assets/js/rsvp.js` baris 10:
```js
const SHEET_URL = 'PASTE_URL_DARI_LANGKAH_3_DI_SINI';
```

### Langkah 5 — Setup Sheet Tamu (opsional)
Di Apps Script editor, jalankan function `setupTamuSheet()` satu kali untuk membuat header otomatis.

---

## 🚀 Deploy ke Netlify

### Cara A — Drag & Drop (Paling Mudah)
1. Buka [netlify.com](https://netlify.com) → Sign up/Login
2. Di dashboard, drag folder `undangan/` ke area **"Want to deploy a new site..."**
3. Tunggu beberapa detik → **Done!**
4. Netlify akan beri URL seperti `https://amazing-name-123.netlify.app`

### Cara B — GitHub (Recommended untuk update mudah)
1. Upload folder ke GitHub repository
2. Di Netlify: **New site from Git → GitHub → Pilih repo**
3. Build command: *(kosongkan)*
4. Publish directory: `/`
5. Klik **Deploy site**

### Cara C — Netlify CLI
```bash
npm install -g netlify-cli
cd undangan/
netlify deploy --prod
```

### Custom Domain (Opsional)
Di Netlify dashboard → **Domain settings → Add custom domain**
Contoh: `undangan-ahmad-nayla.netlify.app` → bisa juga custom domain sendiri

---

## 🔗 Generate & Kirim Link ke 300 Tamu

### Cara Manual (dari browser)
1. Buka website kamu → akan muncul **Generator Link**
2. Masukkan nama tamu satu per satu → klik **Kirim via WA**
3. Atau gunakan **Batch** → paste 300 nama → generate semua → salin

### Format Link
```
https://YOUR-SITE.netlify.app?to=Budi%20Santoso
```
Nama tamu akan otomatis muncul di cover undangan.

### Cara Otomatis via Google Sheets
1. Isi sheet `Tamu` dengan nama & nomor HP 300 tamu
2. Di Apps Script, ganti `BASE_URL` di function `generateLinksForAllGuests()`
3. Jalankan function tersebut → link otomatis tergenerate di kolom E
4. Kirim manual via WA atau gunakan WA Business API

---

## 🎨 Mengganti Ornamen SVG (dari GPT/Illustrator)

Semua ornamen sudah inline di `index.html` maupun tersedia sebagai file di `assets/svg/`.

**Jika punya file PNG dari GPT:**
Di `assets/css/style.css`, ganti setiap referensi SVG inline dengan:
```css
.hero-ornamen-left {
  background-image: url('../img/ornamen-kiri.png');
  background-size: contain;
  background-repeat: no-repeat;
}
```

**Prompt GPT untuk generate ornamen konsisten:**
```
Create a vector ornament in Indonesian/Sundanese wedding style.
Style: gold (#C5973A) on transparent background.
Elements: jasmine/melati flowers, vines, geometric borders.
Format: SVG or PNG with transparent background.
Size: [sesuaikan per kebutuhan]
```

---

## 📊 Monitoring RSVP

Buka Google Sheets kamu → tab **Dashboard** untuk melihat:
- Total yang mengisi RSVP
- Jumlah yang hadir / tidak hadir
- Persentase konfirmasi

---

## 🐛 Troubleshooting

**RSVP tidak masuk ke Sheets?**
- Pastikan SHEET_URL sudah diisi di `rsvp.js`
- Cek Apps Script deployment masih aktif
- Pastikan "Who has access" = **Anyone**

**Musik tidak bunyi?**
- File harus `.mp3` dan ada di `assets/music/`
- Browser modern butuh user gesture sebelum autoplay — sudah ditangani oleh tombol "Buka Undangan"

**Foto tidak muncul?**
- Pastikan path file benar, case-sensitive di server Linux
- Gunakan lowercase untuk nama file: `foto-pria.jpg` bukan `Foto-Pria.JPG`

**Countdown sudah 0?**
- Ganti `WEDDING_DATE` di `main.js` ke tanggal yang benar

---

## 💡 Tips Tambahan

- **Ukuran foto optimal**: 800×1000px untuk foto pasangan, 1200×800px untuk galeri
- **Kompress foto** sebelum upload: pakai [squoosh.app](https://squoosh.app)
- **Test di HP** sebelum sebar ke tamu (tampilan mobile-responsive)
- **Backup link** Google Sheets URL sebelum share ke semua tamu

---

*Dibuat dengan ❤️ — Selamat menuju hari bahagia!*
