/**
 * google-apps-script.js
 * =====================
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1-21YmYpj9WUkY9kRUBdt9TlfKMO3h_r-MJ6ewY_8Z80/edit
 *
 * CARA PASANG (5 menit):
 * 1. Buka spreadsheet di atas
 * 2. Extensions → Apps Script
 * 3. Hapus semua kode → paste seluruh file ini → Save (Ctrl+S)
 * 4. Pilih function "setupAllSheets" → Run → Allow access
 * 5. Deploy → New deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy "Web app URL" → paste ke SHEET_URL di assets/js/rsvp.js
 */

// ─────────────────────────────────────────────
// KONFIGURASI
// ─────────────────────────────────────────────
const CONFIG = {
  SPREADSHEET_ID: '1-21YmYpj9WUkY9kRUBdt9TlfKMO3h_r-MJ6ewY_8Z80',
  RSVP_SHEET:     'RSVP',
  TAMU_SHEET:     'Tamu',
  DASH_SHEET:     'Dashboard',
  MAX_WISHES:     300,
  NOTIFY_EMAIL:   '', // opsional, contoh: 'email@gmail.com'
};

const HEADER_STYLE = {
  bg: '#1C1208',
  fg: '#E2B96F',
};

// ─────────────────────────────────────────────
// SETUP — jalankan 1x dari Apps Script editor
// ─────────────────────────────────────────────
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  setupRsvpSheet_(ss);
  setupTamuSheet_(ss);
  setupDashboardSheet_(ss);
  updateDashboard(ss);

  SpreadsheetApp.getUi().alert(
    'Setup selesai!\n\n' +
    'Tab RSVP, Tamu, dan Dashboard sudah siap.\n' +
    'Langkah berikutnya: Deploy → New deployment → Web App → Anyone'
  );
}

function setupRsvpSheet_(ss) {
  let sheet = ss.getSheetByName(CONFIG.RSVP_SHEET);
  if (!sheet) sheet = ss.insertSheet(CONFIG.RSVP_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'No', 'Timestamp', 'Nama', 'Kehadiran', 'Ucapan',
      'Nama Tamu (URL)', 'User Agent'
    ]);
    styleHeaderRow_(sheet, 7);
  }

  sheet.setFrozenRows(1);
}

function setupTamuSheet_(ss) {
  let sheet = ss.getSheetByName(CONFIG.TAMU_SHEET);
  if (!sheet) sheet = ss.insertSheet(CONFIG.TAMU_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Nama Tamu', 'No HP / WA', 'Grup/Keluarga', 'Status Kirim', 'Link Undangan']);
    styleHeaderRow_(sheet, 5);
  }

  sheet.setFrozenRows(1);
}

function setupDashboardSheet_(ss) {
  let sheet = ss.getSheetByName(CONFIG.DASH_SHEET);
  if (!sheet) sheet = ss.insertSheet(CONFIG.DASH_SHEET);

  sheet.getRange('A1:A7').setValues([
    ['Last Updated'],
    ['Total RSVP'],
    ['Hadir'],
    ['Tidak Hadir'],
    ['Mungkin'],
    ['Target Tamu'],
    ['% Hadir'],
  ]);
  sheet.getRange('A1:A7').setFontWeight('bold');
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 120);
}

function styleHeaderRow_(sheet, cols) {
  sheet.getRange(1, 1, 1, cols)
    .setFontWeight('bold')
    .setBackground(HEADER_STYLE.bg)
    .setFontColor(HEADER_STYLE.fg);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseRequestData_(e) {
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {
      return e.parameter || {};
    }
  }
  return e.parameter || {};
}

function getRsvpSheet_(ss) {
  const sheet = ss.getSheetByName(CONFIG.RSVP_SHEET);
  if (!sheet) {
    throw new Error('Sheet "RSVP" tidak ditemukan. Jalankan setupAllSheets() dulu.');
  }
  return sheet;
}

// ─────────────────────────────────────────────
// POST — terima data dari website
// ─────────────────────────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getRsvpSheet_(ss);

    if (sheet.getLastRow() === 0) {
      setupRsvpSheet_(ss);
    }

    const data = parseRequestData_(e);
    const row = sheet.getLastRow() + 1;

    sheet.appendRow([
      row - 1,
      new Date(),
      data.name || '',
      data.attend || '',
      data.wish || '',
      data.guestParam || '',
      (data.userAgent || '').substring(0, 120),
    ]);

    const attendVal = (data.attend || '').toLowerCase();
    let bg = '#F5EFE0';
    if (attendVal === 'hadir') bg = '#E8F5E9';
    else if (attendVal === 'tidak hadir') bg = '#FFEBEE';
    else if (attendVal === 'mungkin') bg = '#FFF8E1';
    sheet.getRange(row, 1, 1, 7).setBackground(bg);

    updateDashboard(ss);

    if (CONFIG.NOTIFY_EMAIL && data.attend === 'Hadir') {
      MailApp.sendEmail(
        CONFIG.NOTIFY_EMAIL,
        `RSVP Baru — ${data.name} (Hadir)`,
        `${data.name} konfirmasi hadir.\n\nUcapan:\n${data.wish}\n\nWaktu: ${new Date().toLocaleString('id-ID')}`
      );
    }

    return jsonResponse({ status: 'ok', row: row - 1 });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  } finally {
    lock.releaseLock();
  }
}

// ─────────────────────────────────────────────
// GET — kirim data ucapan ke website
// ─────────────────────────────────────────────
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'get';

  if (action === 'get') return getWishes();
  if (action === 'stats') return getStats();
  if (action === 'tamu') return getTamu();

  return jsonResponse({ error: 'unknown action' });
}

function getWishes() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.RSVP_SHEET);
    if (!sheet || sheet.getLastRow() <= 1) {
      return jsonResponse([]);
    }

    const data = sheet.getDataRange().getValues();
    const wishes = data.slice(1).map(row => ({
      name:   row[2] || '',
      attend: row[3] || '',
      wish:   row[4] || '',
      time:   row[1] ? new Date(row[1]).toISOString() : '',
    })).filter(w => w.name && w.wish);

    wishes.sort((a, b) => (a.time > b.time ? 1 : -1));

    return jsonResponse(wishes);

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function getStats() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getRsvpSheet_(ss);
    const rows = sheet.getDataRange().getValues().slice(1);

    return jsonResponse({
      total: rows.length,
      hadir: rows.filter(r => r[3] === 'Hadir').length,
      tidak: rows.filter(r => r[3] === 'Tidak Hadir').length,
      maybe: rows.filter(r => r[3] === 'Mungkin').length,
    });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function getTamu() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.TAMU_SHEET);
    if (!sheet || sheet.getLastRow() <= 1) {
      return jsonResponse([]);
    }

    const tamu = sheet.getDataRange().getValues().slice(1).map(row => ({
      nama:  row[0] || '',
      nomor: row[1] || '',
      grup:  row[2] || '',
      hadir: row[3] || '',
    })).filter(t => t.nama);

    return jsonResponse(tamu);

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ─────────────────────────────────────────────
// Auto-update Dashboard sheet
// ─────────────────────────────────────────────
function updateDashboard(ss) {
  try {
    const rsvpSheet = ss.getSheetByName(CONFIG.RSVP_SHEET);
    let dashSheet = ss.getSheetByName(CONFIG.DASH_SHEET);
    if (!rsvpSheet) return;

    if (!dashSheet) {
      setupDashboardSheet_(ss);
      dashSheet = ss.getSheetByName(CONFIG.DASH_SHEET);
    }

    const rows = rsvpSheet.getLastRow() > 1
      ? rsvpSheet.getDataRange().getValues().slice(1)
      : [];

    const total = rows.length;
    const hadir = rows.filter(r => r[3] === 'Hadir').length;
    const tidak = rows.filter(r => r[3] === 'Tidak Hadir').length;
    const maybe = rows.filter(r => r[3] === 'Mungkin').length;

    dashSheet.getRange('B1').setValue(new Date());
    dashSheet.getRange('B2').setValue(total);
    dashSheet.getRange('B3').setValue(hadir);
    dashSheet.getRange('B4').setValue(tidak);
    dashSheet.getRange('B5').setValue(maybe);
    dashSheet.getRange('B6').setValue(CONFIG.MAX_WISHES);
    dashSheet.getRange('B7').setValue(total > 0 ? Math.round(hadir / total * 100) + '%' : '0%');
  } catch (_) {}
}

// ─────────────────────────────────────────────
// Legacy helpers (tetap tersedia)
// ─────────────────────────────────────────────
function setupTamuSheet() {
  setupTamuSheet_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert('Sheet Tamu sudah disiapkan!');
}

function generateLinksForAllGuests() {
  const BASE_URL = 'https://YOUR_NETLIFY_URL.netlify.app'; // ganti setelah deploy

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.TAMU_SHEET);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    if (name) {
      sheet.getRange(i + 1, 5).setValue(`${BASE_URL}?to=${encodeURIComponent(name)}`);
      count++;
    }
  }

  SpreadsheetApp.getUi().alert(`${count} link berhasil dibuat di kolom E!`);
}
