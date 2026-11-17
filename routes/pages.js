// Public pages, the sitemap, robots.txt and the "not found" and error pages.

const express = require('express');
const { isProd, site } = require('../lib/config');
const { pages, notFoundPage, renderPage } = require('../lib/pages');
const { sendHtml, wantsJson } = require('../lib/http');

const router = express.Router();

// On the live site every page is built once at startup and served from memory.
// If any page fails to build, the process stops and the previous version stays live.
const prerendered = new Map();

function prerenderAll() {
  for (const page of [...pages, notFoundPage]) prerendered.set(page.path, renderPage(page));
  return prerendered.size;
}

function pageHtml(page) {
  return isProd && prerendered.has(page.path) ? prerendered.get(page.path) : renderPage(page);
}

for (const page of pages) {
  router.get(page.path, (req, res) => sendHtml(res, pageHtml(page)));
}

router.get('/index.html', (req, res) => res.redirect(301, '/'));

router.get('/sitemap.xml', (req, res) => {
  const urls = pages
    .filter((page) => !page.noindex)
    .map((page) => `  <url>\n    <loc>${page.canonical}</loc>\n    <lastmod>${page.updated}</lastmod>\n  </url>`)
    .join('\n');
  res
    .type('application/xml')
    .set('Cache-Control', 'public, max-age=3600')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

router.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .set('Cache-Control', 'public, max-age=3600')
    .send(['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', '', `Sitemap: ${site.url}/sitemap.xml`, ''].join('\n'));
});

function notFound(req, res) {
  if (wantsJson(req)) return res.status(404).json({ ok: false, error: 'Not found.' });
  sendHtml(res, pageHtml(notFoundPage), 404);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error('Unhandled error:', err);

  if (wantsJson(req)) {
    const message = status === 500 ? 'Something went wrong on our side. Please try again.' : 'That request could not be read.';
    return res.status(status).json({ ok: false, error: message });
  }
  res
    .status(status)
    .type('html')
    .send(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<meta name="robots" content="noindex"><title>Something went wrong | Quorvia Marketing</title></head>' +
        '<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:15vh auto;padding:0 1.5rem;color:#122A38">' +
        '<h1>Something went wrong</h1><p>Sorry about that. Please go back and try again, or return to the <a href="/">home page</a>.</p></body></html>'
    );
}

module.exports = { router, prerenderAll, notFound, errorHandler };
