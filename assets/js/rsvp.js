/**
 * rsvp.js — Google Sheets Integration
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1-21YmYpj9WUkY9kRUBdt9TlfKMO3h_r-MJ6ewY_8Z80/edit
 *
 * Setelah deploy Apps Script, paste Web App URL di SHEET_URL di bawah.
 * Format URL: https://script.google.com/macros/s/XXXX/exec
 */

const SPREADSHEET_ID = 'https://docs.google.com/spreadsheets/d/1-21YmYpj9WUkY9kRUBdt9TlfKMO3h_r-MJ6ewY_8Z80/edit?gid=451570177#gid=451570177';

// Web App URL — Google Apps Script deploy
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyPEBfWqRww1vyExG426-nc7tgyRBswYxU-hYD-7DyNF-IpwWBjfPFUtLBCILkQTS8x/exec';

const DEMO_MODE = SHEET_URL === 'GANTI_DENGAN_GOOGLE_APPS_SCRIPT_URL';

/* ================================================
   SUBMIT RSVP
   ================================================ */
async function submitRSVP() {
  const name   = document.getElementById('rsvp-name').value.trim();
  const attend = document.getElementById('rsvp-attend').value;
  const wish   = document.getElementById('rsvp-wish').value.trim();

  if (!name || !attend || !wish) {
    showToast('⚠ Mohon lengkapi semua field!');
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Mengirim…';

  const params = new URLSearchParams(location.search);
  const guestName = params.get('to') || params.get('nama') || '';

  const payload = {
    name,
    attend,
    wish,
    guestParam: guestName,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.substring(0, 100)
  };

  try {
    if (DEMO_MODE) {
      await fakeSendDelay();
    } else {
      // text/plain = simple request, hindari masalah CORS preflight
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    }

    document.getElementById('rsvp-name').value = '';
    document.getElementById('rsvp-attend').value = '';
    document.getElementById('rsvp-wish').value = '';

    const msg = document.getElementById('submit-msg');
    if (msg) msg.style.display = 'block';

    showToast(' Ucapan terkirim! Terima kasih yaa');
    addWishToList(name, attend, wish);

    try {
      const sent = JSON.parse(localStorage.getItem('rsvp_sent') || '[]');
      sent.push({ name, time: Date.now() });
      localStorage.setItem('rsvp_sent', JSON.stringify(sent.slice(-20)));
    } catch (_) {}

  } catch (e) {
    showToast('Gagal mengirim. Coba lagi ya!');
    console.error('RSVP error:', e);
  }

  btn.disabled = false;
  btn.textContent = 'Kirim Ucapan';
}

function fakeSendDelay() {
  return new Promise(resolve => setTimeout(resolve, 800));
}

/* ================================================
   LOAD WISHES FROM SHEET
   ================================================ */
async function loadWishes() {
  const list = document.getElementById('wishes-list');
  if (!list) return;

  if (DEMO_MODE) {
    const demos = [
      { name: 'Budi Santoso',  attend: 'Hadir',       wish: 'Selamat ya! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah 🎉' },
      { name: 'Siti Rahayu',   attend: 'Hadir',       wish: 'Barakallahu lakuma wa baraka alaikuma, wa jama\'a bainakuma fii khair 💕' },
      { name: 'Pak Ridwan',    attend: 'Hadir',       wish: 'Doa terbaik dari keluarga kami. Semoga pernikahan kalian menjadi berkah.' },
      { name: 'Dewi Fitriani', attend: 'Tidak Hadir', wish: 'Maaf tidak bisa hadir, semoga acaranya berjalan lancar dan penuh berkah 🌸' },
    ];
    demos.forEach(d => addWishToList(d.name, d.attend, d.wish));
    return;
  }

  try {
    const res = await fetch(`${SHEET_URL}?action=get`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn('RSVP API error:', data);
      return;
    }

    list.innerHTML = '';
    if (data.length > 0) {
      // Data oldest-first; prepend per item → newest tampil di atas
      data.forEach(d => addWishToList(d.name, d.attend, d.wish));
    } else {
      list.innerHTML = '<div class="wish-empty">Belum ada ucapan. Jadilah yang pertama! </div>';
    }
  } catch (e) {
    console.warn('Gagal load wishes:', e);
  }
}

/* ================================================
   ADD WISH TO DOM
   ================================================ */
function addWishToList(name, attend, wish) {
  const list = document.getElementById('wishes-list');
  if (!list) return;

  const empty = list.querySelector('.wish-empty');
  if (empty) empty.remove();

  const icons = { 'Hadir': '✓ ', 'Tidak Hadir': '✗ ', 'Mungkin': '? ' };
  const icon = icons[attend] || '💌';

  const item = document.createElement('div');
  item.className = 'wish-item';
  item.innerHTML = `
    <div class="wish-name">${escHtml(name)}</div>
    <div class="wish-attend">${icon} ${escHtml(attend)}</div>
    <div class="wish-text">${escHtml(wish)}</div>
  `;
  list.prepend(item);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
