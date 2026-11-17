// The private lead tracker at /admin: log in, see every form submission, update its status and notes,
// and add leads by hand.

const crypto = require('crypto');
const express = require('express');
const { isProd } = require('../lib/config');
const { asset } = require('../lib/assets');
const { logoMarkSvg } = require('../lib/brand');
const { getAllSubmissions, addSubmission, updateSubmission } = require('../lib/store');
const { createRateLimiter, clientIp } = require('../lib/spam');

const router = express.Router();

const LEAD_STATUSES = ['New Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'];
const SESSION_HOURS = 12;

// The old default password was published in this project's public README, so it is never accepted on
// the live site. Locally it still works, to keep development simple.
const LOCAL_DEV_PASSWORD = 'tabletop2026';
const configuredPassword = String(process.env.ADMIN_PASSWORD || '').trim();
const ADMIN_PASSWORD = isProd
  ? configuredPassword && configuredPassword !== LOCAL_DEV_PASSWORD
    ? configuredPassword
    : null
  : configuredPassword || LOCAL_DEV_PASSWORD;

const adminEnabled = ADMIN_PASSWORD !== null;

// Session tokens are kept in memory, so everyone is logged out when the server restarts.
const sessions = new Map();
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8 });

function isAuthed(req) {
  const token = req.cookies && req.cookies.admin_session;
  const expires = token && sessions.get(token);
  if (!expires) return false;
  if (expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function shell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}: Quorvia Marketing</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="${asset('/css/admin.css')}">
</head>
<body class="admin-body">
${body}
</body>
</html>`;
}

const LOGO = logoMarkSvg('logo-mark');

// Nothing under /admin should ever be cached or indexed.
router.use('/admin', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

router.post('/admin/login', (req, res) => {
  if (!adminEnabled) return res.redirect('/admin');
  if (!loginLimiter.take(clientIp(req))) return res.redirect('/admin?error=locked');

  const supplied = Buffer.from(String((req.body && req.body.password) || ''));
  const expected = Buffer.from(ADMIN_PASSWORD);
  const match = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  if (!match) return res.redirect('/admin?error=1');

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  });
  res.redirect('/admin');
});

router.post('/admin/logout', (req, res) => {
  const token = req.cookies && req.cookies.admin_session;
  if (token) sessions.delete(token);
  res.clearCookie('admin_session');
  res.redirect('/admin');
});

// --- Manually add a lead ---
router.post('/admin/leads', async (req, res) => {
  if (!isAuthed(req)) return res.redirect('/admin');

  const { restaurant, name, email, phone, notes } = req.body || {};
  if (!restaurant || !String(restaurant).trim() || !name || !String(name).trim()) {
    return res.redirect('/admin');
  }

  const entry = {
    id: crypto.randomUUID(),
    name: String(name).trim().slice(0, 200),
    email: String(email || '').trim().slice(0, 200),
    restaurant: String(restaurant).trim().slice(0, 200),
    phone: String(phone || '').trim().slice(0, 50),
    message: String(notes || '').trim().slice(0, 2000),
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

// --- Update a lead's status and notes ---
router.post('/admin/leads/:id', async (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ ok: false, error: 'Not authenticated' });

  const { status, notes } = req.body || {};
  if (!LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid status' });
  }

  try {
    await updateSubmission(req.params.id, { status, message: String(notes || '').slice(0, 4000) });
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to update lead:', err);
    res.status(500).json({ ok: false, error: 'Failed to save changes' });
  }
});

// --- Login form or the lead table ---
router.get('/admin', async (req, res, next) => {
  if (!adminEnabled) {
    return res.send(
      shell(
        'Lead Tracker',
        `<main class="admin-login">
    <h1>${LOGO}Lead Tracker</h1>
    <p><strong>The lead tracker is switched off until a private password is set.</strong></p>
    <p>New messages from the website are still being saved. Nothing is lost.</p>
    <p>To switch it back on: open your Render dashboard, choose this service, go to <strong>Environment</strong>, add a variable named <code>ADMIN_PASSWORD</code> with a password only you know, and save. The site restarts by itself and this page becomes the login.</p>
  </main>`
      )
    );
  }

  if (!isAuthed(req)) {
    const errorMsg =
      req.query.error === 'locked'
        ? '<p class="admin-error" role="alert">Too many attempts. Please wait 15 minutes and try again.</p>'
        : req.query.error
          ? '<p class="admin-error" role="alert">Incorrect password.</p>'
          : '';
    return res.send(
      shell(
        'Admin Login',
        `<main class="admin-login">
    <h1>${LOGO}Admin Login</h1>
    ${errorMsg}
    <form method="POST" action="/admin/login">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" autocomplete="current-password" required autofocus>
      <button type="submit" class="btn btn-primary">Log In</button>
    </form>
  </main>`
      )
    );
  }

  let submissions;
  try {
    submissions = await getAllSubmissions();
  } catch (err) {
    return next(err);
  }

  const rows = submissions
    .map((s) => {
      const statusOptions = LEAD_STATUSES.map(
        (opt) => `<option value="${opt}"${opt === s.status ? ' selected' : ''}>${opt}</option>`
      ).join('');
      return `
    <tr id="row-${escapeHtml(s.id)}" data-status="${escapeHtml(s.status)}">
      <td>${escapeHtml(new Date(s.submittedAt).toLocaleString('en-CA'))}</td>
      <td>${escapeHtml(s.restaurant)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td><select class="status-select" aria-label="Status" onchange="this.closest('tr').dataset.status=this.value">${statusOptions}</select></td>
      <td><textarea class="notes-input" rows="3" aria-label="Notes">${escapeHtml(s.message)}</textarea></td>
      <td><button type="button" class="btn btn-small btn-primary" onclick="saveLead('${escapeHtml(s.id)}', this)">Save</button></td>
    </tr>`;
    })
    .join('');

  res.send(
    shell(
      'Lead Tracker',
      `<main class="admin-dashboard">
    <div class="admin-header">
      <h1>${LOGO}Lead Tracker <span class="count">(${submissions.length})</span></h1>
      <form method="POST" action="/admin/logout"><button type="submit" class="btn btn-outline">Log Out</button></form>
    </div>

    <div class="lead-form-card">
      <h2>Add a Lead</h2>
      <form method="POST" action="/admin/leads" class="lead-form">
        <div class="form-row">
          <label for="lead-restaurant">Business Name*</label>
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

    ${
      submissions.length === 0
        ? '<p>No leads yet.</p>'
        : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Business</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th>Notes</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
    }
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
  </script>`
    )
  );
});

module.exports = { router, adminEnabled };
