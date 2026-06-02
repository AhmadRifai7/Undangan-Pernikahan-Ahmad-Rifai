# 📊 Setup Google Sheets Integration untuk RSVP

## ✅ Status Saat Ini
- ✓ Button RSVP sudah bisa diklik
- ✓ Form submit lokal berfungsi  
- ⚠ Google Sheets integration perlu disetup

---

## 🚀 Langkah-Langkah Setup (5 menit)

### 1️⃣ Buka Google Spreadsheet
Akses spreadsheet di sini:
```
https://docs.google.com/spreadsheets/d/1-21YmYpj9WUkY9kRUBdt9TlfKMO3h_r-MJ6ewY_8Z80/edit
```

### 2️⃣ Buka Google Apps Script Editor
1. Klik menu **Extensions** (Ekstensi) di bagian atas
2. Pilih **Apps Script**
3. Jendela editor baru akan terbuka

### 3️⃣ Copy Kode Google Apps Script
1. Di folder project undangan, buka file: `google-apps-script.js`
2. **Select All** (Ctrl+A) dan **Copy** (Ctrl+C)
3. Kembali ke editor Google Apps Script
4. **Hapus semua kode** yang sudah ada
5. **Paste** kode baru (Ctrl+V)
6. **Save** (Ctrl+S)

### 4️⃣ Jalankan Setup Function
1. Di dropdown **Select function**, pilih `setupAllSheets`
2. Klik **Run** (tombol play ▶)
3. **Approve permissions** ketika diminta (klik **Review permissions** → **Allow**)
4. Tunggu hingga ada notification "Setup selesai!"

### 5️⃣ Deploy sebagai Web App
1. Klik **Deploy** (tombol atas kanan)
2. Pilih **New deployment**
3. Pilih type: **Web app**
4. Isi:
   - **Execute as**: Pilih email akun Anda
   - **Who has access**: Ubah ke **Anyone**
5. Klik **Deploy**
6. **Copy Web app URL** yang muncul (lihat di bagian "New deployment")

### 6️⃣ Update SHEET_URL di Website
1. Buka file: `assets/js/rsvp.js`
2. Cari baris:
   ```javascript
   const SHEET_URL = 'https://script.google.com/macros/s/...';
   ```
3. **Ganti dengan URL Web App** yang Anda copy tadi
4. **Save** file (Ctrl+S)

---

## ✨ Hasil Setup
Setelah setup selesai:
- ✅ Data RSVP otomatis tersimpan di Google Sheets
- ✅ Sheet "RSVP" menyimpan semua respon (Nama, Kehadiran, Ucapan)
- ✅ Sheet "Tamu" untuk data tamu (opsional)
- ✅ Sheet "Dashboard" menampilkan statistik real-time
- ✅ Ucapan ditampilkan otomatis di website

---

## 🔍 Testing
1. Refresh website (F5)
2. Scroll ke section RSVP
3. Isi form:
   - Nama: Test User
   - Kehadiran: Insyaallah Hadir
   - Ucapan: Tes integrasi
4. Klik **Kirim Ucapan**
5. Periksa:
   - ✓ Ucapan tampil di halaman
   - ✓ Toast notification muncul
   - ✓ Buka Google Sheets → lihat sheet "RSVP" sudah ada data baru

---

## ❌ Troubleshooting

### Jika muncul error saat deploy:
- Pastikan Anda **Allow permissions** saat diminta
- Coba logout & login Google lagi

### Jika data tidak tersimpan di Sheets:
- Verifikasi SHEET_URL sudah benar di `rsvp.js`
- Periksa bahwa deployment adalah "Web app" bukan "API executable"

### Jika website error:
- Buka **Developer Console** (F12)
- Lihat tab **Console** untuk pesan error
- Periksa URL Web App tidak ada typo

---

## 📝 Catatan Penting
- Jangan hapus spreadsheet atau Apps Script
- Deploy ulang jika ada perubahan kode Apps Script
- URL Web App berubah setiap kali deploy baru

---

**Butuh bantuan?** Check browser console (F12 → Console) untuk error details.
