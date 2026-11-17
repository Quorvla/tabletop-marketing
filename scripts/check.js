// Site check: `npm run check`
// Builds every page and fails if anything a visitor or a search engine relies on is missing:
// unique titles and descriptions, one main heading, canonical links, image alt text and sizes,
// valid structured data, and internal links that all lead somewhere.

process.env.LEADS_STORE = 'file';
const fs = require('fs');
const path = require('path');
const { pages, notFoundPage, renderPage } = require('../lib/pages');

const problems = [];
const fail = (page, message) => problems.push(`${page.path}: ${message}`);
const known = new Set(pages.map((p) => p.path));
const publicDir = path.join(__dirname, '..', 'public');
const titles = new Map();
const descriptions = new Map();

for (const page of [...pages, notFoundPage]) {
  const html = renderPage(page);
  const count = (re) => (html.match(re) || []).length;

  if (count(/<h1[\s>]/g) !== 1) fail(page, `expected exactly one <h1>, found ${count(/<h1[\s>]/g)}`);
  if (!html.includes(`<link rel="canonical" href="${page.canonical}">`)) fail(page, 'canonical link missing');
  if (page.title.length > 62) fail(page, `title is ${page.title.length} characters (keep it to 62)`);
  if (page.description.length < 70 || page.description.length > 165) fail(page, `description is ${page.description.length} characters (aim for 70 to 165)`);
  if (titles.has(page.title)) fail(page, `title duplicates ${titles.get(page.title)}`);
  if (descriptions.has(page.description)) fail(page, `description duplicates ${descriptions.get(page.description)}`);
  titles.set(page.title, page.path);
  descriptions.set(page.description, page.path);
  if (/[—]/.test(html)) fail(page, 'contains an em dash');
  if (/lorem ipsum|TODO|placeholder text/i.test(html)) fail(page, 'contains placeholder text');

  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\balt="/.test(img)) fail(page, `image without alt: ${img.slice(0, 80)}`);
    if (!/\bwidth="\d+"/.test(img) || !/\bheight="\d+"/.test(img)) fail(page, `image without width/height: ${img.slice(0, 80)}`);
  }

  for (const block of html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || []) {
    try {
      JSON.parse(block.replace(/^<script[^>]*>|<\/script>$/g, ''));
    } catch {
      fail(page, 'structured data is not valid JSON');
    }
  }

  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = href.split('#')[0].split('?')[0];
    if (!target || known.has(target)) continue;
    if (fs.existsSync(path.join(publicDir, target))) continue;
    fail(page, `link to a page or file that does not exist: ${href}`);
  }
}

if (problems.length) {
  console.error(`Site check failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Site check passed: ${pages.length + 1} pages, no problems found.`);
