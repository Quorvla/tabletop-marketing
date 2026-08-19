require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const { getAllSubmissions, addSubmission, USE_DB } = require('./lib/store');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tabletop2026';

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
  const rows = submissions.map((s) => `
    <tr>
      <td>${escapeHtml(new Date(s.submittedAt).toLocaleString())}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td>${escapeHtml(s.restaurant)}</td>
      <td>${escapeHtml(s.message)}</td>
    </tr>`).join('');

  res.send(`<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Submissions: Tabletop Marketing</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="admin-body">
  <main class="admin-dashboard">
    <div class="admin-header">
      <h1>${LOGO_MARK}Contact Form Submissions <span class="count">(${submissions.length})</span></h1>
      <form method="POST" action="/admin/logout"><button type="submit" class="btn btn-outline">Log Out</button></form>
    </div>
    ${submissions.length === 0 ? '<p>No submissions yet.</p>' : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Restaurant</th><th>Message</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`}
  </main>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Tabletop Marketing site running at http://localhost:${PORT}`);
  console.log(`Admin dashboard at http://localhost:${PORT}/admin (password: ${ADMIN_PASSWORD})`);
  console.log(`Submission storage: ${USE_DB ? 'Postgres (DATABASE_URL)' : 'local file (data/submissions.json)'}`);
});
