# ✅ RSVP Setup Checklist

> Ikuti langkah-langkah ini untuk mengintegrasikan RSVP dengan Google Sheets

## Phase 1: Verifikasi Button Fungsional
- [ ] Buka `index.html` di browser
- [ ] Scroll ke section RSVP
- [ ] **Test:** Klik button "Kirim Ucapan" 
  - Expected: Toast "⚠ Mohon lengkapi semua field!" muncul
- [ ] **Result:** Button SUDAH RESPONSIF ✅

---

## Phase 2: Setup Google Apps Script

### Akses Spreadsheet
- [ ] Buka link: https://docs.google.com/spreadsheets/d/1-21YmYpj9WUkY9kRUBdt9TlfKMO3h_r-MJ6ewY_8Z80/edit
- [ ] Login dengan akun Google (pasti punya akses)

### Setup Apps Script
- [ ] Klik **Extensions** → **Apps Script**
- [ ] Buka file `google-apps-script.js` dari folder project
- [ ] Select All (Ctrl+A) - copy seluruh kode
- [ ] Di editor Apps Script, delete semua kode lama
- [ ] Paste kode baru (Ctrl+V)
- [ ] Save (Ctrl+S)

### Jalankan Setup Function
- [ ] Dropdown **Select function** → pilih `setupAllSheets`
- [ ] Klik **Run** (tombol ▶)
- [ ] **Allow permissions** jika ada popup
- [ ] Tunggu notification "Setup selesai!" ✅

### Deploy sebagai Web App
- [ ] Klik **Deploy** (atas kanan)
- [ ] Pilih **New deployment**
- [ ] Type: **Web app**
- [ ] **Execute as:** Email akun Anda
- [ ] **Who has access:** UBAH KE **Anyone**
- [ ] Klik **Deploy**
- [ ] **COPY Web App URL** yang muncul

Example URL:
```
https://script.google.com/macros/s/AKfycby.../exec
```

---

## Phase 3: Update Website Code

### Update SHEET_URL
- [ ] Buka file: `assets/js/rsvp.js`
- [ ] Cari baris:
  ```javascript
  const SHEET_URL = 'https://script.google.com/macros/s/...';
  ```
- [ ] **GANTI** dengan URL Web App yang Anda copy tadi
- [ ] Save file (Ctrl+S)

---

## Phase 4: Testing

### Test Form Submission
- [ ] Refresh website (F12 close, F5 refresh)
- [ ] Scroll ke RSVP section
- [ ] **Isi form:**
  - Nama: "Test Submission"
  - Kehadiran: "Insyaallah Hadir"
  - Ucapan: "Test integration dengan Google Sheets"
- [ ] Klik **Kirim Ucapan**
- [ ] Check:
  - [ ] ✓ Toast "Ucapan terkirim!" muncul
  - [ ] ✓ Ucapan tampil di halaman
  - [ ] ✓ Form kosong (direset)

### Test Google Sheets
- [ ] Kembali ke spreadsheet
- [ ] Buka tab **"RSVP"**
- [ ] Lihat apakah data baru ada di baris terakhir:
  - Kolom A: Nomor
  - Kolom B: Timestamp
  - Kolom C: Nama ("Test Submission")
  - Kolom D: Kehadiran
  - Kolom E: Ucapan
- [ ] ✓ Data tersimpan dengan benar!

### Test Data Loading
- [ ] Refresh website (F5)
- [ ] Scroll ke section "Doa & Ucapan"
- [ ] Cek apakah ucapan Anda muncul di list
- [ ] ✓ Data loaded dari Sheets!

---

## Phase 5: Browser Console Debugging

**Jika ada masalah**, check console:
1. Tekan **F12** (Developer Tools)
2. Buka tab **Console**
3. Lihat logs:

**Expected logs:**
```
[RSVP Init] {DEMO_MODE: false, SHEET_URL: "configured"}
[RSVP Submit] Sending to: https://script.google.com/macros/s/...
[RSVP Submit] Request sent (no-cors mode - response not readable)
[Wishes] Fetching from: https://script.google.com/macros/s/...?action=get
[Wishes] Received: X items
```

---

## ✨ Success Criteria

| Item | Status |
|------|--------|
| Button bisa diklik | ✅ Sudah |
| Form bisa disubmit | ✅ Sudah |
| Data tampil di halaman | ✅ Sudah |
| Data tersimpan di Google Sheets | ⏳ Tunggu setup |
| Ucapan dimuat dari Sheets | ⏳ Tunggu setup |

---

## 🆘 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Apps Script not found" | Pastikan diklik Extensions → Apps Script |
| "Permission denied" | Klik Review permissions → Allow |
| Button tidak merespon | Clear cache (Ctrl+Shift+Delete) dan refresh |
| Data tidak tersimpan | Check console (F12) untuk error details |
| Data tidak muncul di Sheets | Verify SHEET_URL sudah benar di rsvp.js |
| CORS error | Normal dengan `mode: 'no-cors'`, bukan error |

---

## 📱 Next Steps

Setelah semua berjalan:
1. **Customize form** - Tambah fields sesuai kebutuhan
2. **Deploy website** - Upload ke Netlify/Vercel
3. **Generate guest links** - Gunakan admin generator di `?admin`
4. **Monitor Sheets** - Track RSVP real-time di Google Sheets

---

**Estimated time:** ~5-10 minutes  
**Difficulty:** Easy  
**Questions?** Check console (F12 → Console) atau lihat `SETUP_GOOGLE_SHEETS.md` untuk detail lebih lanjut.
