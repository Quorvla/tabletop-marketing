// Quorvia Marketing website.
// This file only wires the pieces together. The pages are in /views, the text in /content,
// the form handling in /routes/leads.js and the private lead tracker in /routes/admin.js.

require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const { isProd, port, site, tracking } = require('./lib/config');
const { setStaticHeaders } = require('./lib/assets');
const { securityHeaders, redirectTrailingSlash } = require('./lib/http');
const { USE_DB } = require('./lib/store');
const pages = require('./routes/pages');
const leads = require('./routes/leads');
const admin = require('./routes/admin');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(compression());
app.use(securityHeaders);

// Used by the keep-awake ping below and by uptime monitors.
app.get('/healthz', (req, res) => res.type('text').send('ok'));

app.use(redirectTrailingSlash);
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { index: false, setHeaders: setStaticHeaders }));

app.use(leads.router);
app.use(admin.router);
app.use(pages.router);
app.use(pages.notFound);
app.use(pages.errorHandler);

// Build every page once before accepting visitors. A template mistake stops the start-up here,
// which on the live host means the previous working version stays online.
const pageCount = pages.prerenderAll();

app.listen(port, () => {
  console.log(`Quorvia Marketing site running at http://localhost:${port} (${isProd ? 'production' : 'development'} mode)`);
  console.log(`Public address used for links and the sitemap: ${site.url}`);
  console.log(`Pages built: ${pageCount}`);
  console.log(`Lead storage: ${USE_DB ? 'Postgres (DATABASE_URL)' : 'local file (data/submissions.json)'}`);
  console.log(`Lead tracker at /admin: ${admin.adminEnabled ? 'on' : 'OFF until ADMIN_PASSWORD is set'}`);
  console.log(`Analytics: ${tracking.mode === 'off' ? 'off (no tracking IDs set)' : tracking.mode}`);

  // Render's free plan sleeps the site after about 15 minutes without visitors; pinging ourselves keeps it awake.
  if (process.env.RENDER_EXTERNAL_URL && typeof fetch === 'function') {
    setInterval(() => {
      fetch(`${process.env.RENDER_EXTERNAL_URL}/healthz`).catch(() => {});
    }, 10 * 60 * 1000);
  }
});
