// Small HTTP helpers shared by the routes.

const { isProd } = require('./config');

/** Security headers for every response. */
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"
  );
  if (isProd) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
}

/** /services/ and /services are the same page, so send the first to the second. */
function redirectTrailingSlash(req, res, next) {
  if ((req.method === 'GET' || req.method === 'HEAD') && req.path.length > 1 && req.path.endsWith('/')) {
    const cleanPath = `/${req.path.replace(/^\/+|\/+$/g, '')}`;
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanPath + query);
  }
  next();
}

/** Sends a rendered page. The ETag lets browsers skip the download when nothing changed. */
function sendHtml(res, html, status = 200) {
  res.status(status).set('Cache-Control', 'public, max-age=0, must-revalidate').type('html').send(html);
}

function wantsJson(req) {
  return req.path.startsWith('/api/') || req.is('json') || String(req.headers.accept || '').includes('application/json');
}

module.exports = { securityHeaders, redirectTrailingSlash, sendHtml, wantsJson };
