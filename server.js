require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const { getAllSubmissions, addSubmission, updateSubmission, USE_DB } = require('./lib/store');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tabletop2026';
const LEAD_STATUSES = ['New Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'];

// In-memory session tokens for the admin page (reset on restart — fine for a single-user local tool)
const sessions = new Set();

function isAuthed(req) {
  const token = req.cookies && req.cookies.admin_session;
  return !!token && sessions.has(token);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const LOGO_MARK = `<svg class="logo-mark" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="18" y="30" width="5" height="65" rx="2.5" fill="currentColor"/>
  <rect x="26" y="30" width="5" height="65" rx="2.5" fill="currentColor"/>
  <rect x="34" y="30" width="5" height="65" rx="2.5" fill="currentColor"/>
  <rect x="42" y="30" width="5" height="65" rx="2.5" fill="currentColor"/>
  <rect x="28" y="88" width="9" height="80" rx="4" fill="currentColor"/>
  <path d="M200,90 L200,55 Q200,32 214,30 Q209,55 209,90 Z" fill="currentColor"/>
  <rect x="200" y="88" width="9" height="80" rx="4" fill="currentColor"/>
  <circle cx="120" cy="99" r="68" fill="none" stroke="currentColor" stroke-width="9"/>
  <rect x="95" y="130" width="14" height="30" rx="2" fill="currentColor"/>
  <rect x="113" y="110" width="14" height="50" rx="2" fill="currentColor"/>
  <rect x="131" y="85" width="14" height="75" rx="2" fill="currentColor"/>
  <path d="M88,150 C115,180 150,150 170,100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <polygon points="182,86 158,94 174,112" fill="currentColor"/>
</svg>`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Contact form submission ---
app.post('/api/contact', async (req, res) => {
  const { name, email, restaurant, phone, message } = req.body;

  if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
    return res.status(400).json({ ok: false, error: 'Name, email, and message are required.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  const entry = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 200),
    email: email.trim().slice(0, 200),
    restaurant: (restaurant || '').trim().slice(0, 200),
    phone: (phone || '').trim().slice(0, 50),
    message: message.trim().slice(0, 2000),
    status: 'New Lead',
    submittedAt: new Date().toISOString(),
  };

  try {
    await addSubmission(entry);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save submission:', err);
    res.status(500).json({ ok: false, error: 'Something went wrong saving your message. Please try again.' });
  }
});

// --- Admin login ---
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const suppliedBuf = Buffer.from(String(password || ''));
  const expectedBuf = Buffer.from(ADMIN_PASSWORD);
  const match =
    suppliedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(suppliedBuf, expectedBuf);

  if (!match) {
    return res.redirect('/admin?error=1');
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.add(token);
  res.cookie('admin_session', token, { httpOnly: true, sameSite: 'lax' });
  res.redirect('/admin');
});

app.post('/admin/logout', (req, res) => {
  const token = req.cookies && req.cookies.admin_session;
  if (token) sessions.delete(token);
  res.clearCookie('admin_session');
  res.redirect('/admin');
});

// --- Manually add a lead ---
app.post('/admin/leads', async (req, res) => {
  if (!isAuthed(req)) return res.redirect('/admin');

  const { restaurant, name, email, phone, notes } = req.body;
  if (!restaurant || !restaurant.trim() || !name || !name.trim()) {
    return res.redirect('/admin');
  }

  const entry = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 200),
    email: (email || '').trim().slice(0, 200),
    restaurant: restaurant.trim().slice(0, 200),
    phone: (phone || '').trim().slice(0, 50),
    message: (notes || '').trim().slice(0, 2000),
    status: 'New Lead',
    submittedAt: new Date().toISOString(),
  };

  try {
    await addSubmission(entry);
  } catch (err) {
    console.error('Failed to add lead:', err);
  }
  res.redirect('/admin');
});

// --- Update a lead's status/notes ---
app.post('/admin/leads/:id', async (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ ok: false, error: 'Not authenticated' });

  const { status, notes } = req.body;
  if (!LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid status' });
  }

  try {
    await updateSubmission(req.params.id, { status, message: String(notes || '').slice(0, 2000) });
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to update lead:', err);
    res.status(500).json({ ok: false, error: 'Failed to save changes' });
  }
});

// --- Admin page (login form or submissions table) ---
app.get('/admin', async (req, res) => {
  if (!isAuthed(req)) {
    const errorMsg = req.query.error
      ? '<p class="admin-error">Incorrect password.</p>'
      : '';
    res.send(`<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Admin Login: Tabletop Marketing</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="admin-body">
  <main class="admin-login">
    <h1>${LOGO_MARK}Admin Login</h1>
    ${errorMsg}
    <form method="POST" action="/admin/login">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autofocus>
      <button type="submit" class="btn btn-primary">Log In</button>
    </form>
  </main>
</body>
</html>`);
    return;
  }

  const submissions = await getAllSubmissions();
  const rows = submissions.map((s) => {
    const statusOptions = LEAD_STATUSES.map((opt) =>
      `<option value="${opt}"${opt === s.status ? ' selected' : ''}>${opt}</option>`
    ).join('');
    return `
    <tr id="row-${s.id}" data-status="${escapeHtml(s.status)}">
      <td>${escapeHtml(new Date(s.submittedAt).toLocaleString())}</td>
      <td>${escapeHtml(s.restaurant)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td><select class="status-select" onchange="this.closest('tr').dataset.status=this.value">${statusOptions}</select></td>
      <td><textarea class="notes-input" rows="2">${escapeHtml(s.message)}</textarea></td>
      <td><button type="button" class="btn btn-small btn-primary" onclick="saveLead('${s.id}', this)">Save</button></td>
    </tr>`;
  }).join('');

  res.send(`<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Lead Tracker: Tabletop Marketing</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="admin-body">
  <main class="admin-dashboard">
    <div class="admin-header">
      <h1>${LOGO_MARK}Lead Tracker <span class="count">(${submissions.length})</span></h1>
      <form method="POST" action="/admin/logout"><button type="submit" class="btn btn-outline">Log Out</button></form>
    </div>

    <div class="lead-form-card">
      <h2>Add a Lead</h2>
      <form method="POST" action="/admin/leads" class="lead-form">
        <div class="form-row">
          <label for="lead-restaurant">Restaurant Name*</label>
          <input type="text" id="lead-restaurant" name="restaurant" required>
        </div>
        <div class="form-row">
          <label for="lead-name">Contact Name*</label>
          <input type="text" id="lead-name" name="name" required>
        </div>
        <div class="form-row">
          <label for="lead-email">Email</label>
          <input type="email" id="lead-email" name="email">
        </div>
        <div class="form-row">
          <label for="lead-phone">Phone</label>
          <input type="tel" id="lead-phone" name="phone">
        </div>
        <div class="form-row form-row-wide">
          <label for="lead-notes">Notes</label>
          <textarea id="lead-notes" name="notes" rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Add Lead</button>
      </form>
    </div>

    ${submissions.length === 0 ? '<p>No leads yet.</p>' : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Restaurant</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th>Notes</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`}
  </main>
  <script>
    async function saveLead(id, btn) {
      const row = document.getElementById('row-' + id);
      const status = row.querySelector('.status-select').value;
      const notes = row.querySelector('.notes-input').value;
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        const res = await fetch('/admin/leads/' + id, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes }),
        });
        const data = await res.json();
        btn.textContent = data.ok ? 'Saved' : 'Error';
        if (data.ok) row.dataset.status = status;
      } catch (err) {
        btn.textContent = 'Error';
      }
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
    }
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Tabletop Marketing site running at http://localhost:${PORT}`);
  console.log(`Admin dashboard at http://localhost:${PORT}/admin (password: ${ADMIN_PASSWORD})`);
  console.log(`Submission storage: ${USE_DB ? 'Postgres (DATABASE_URL)' : 'local file (data/submissions.json)'}`);
});
