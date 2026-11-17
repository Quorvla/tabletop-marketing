// Gives every stylesheet, script and image a version tag based on its contents, for example
// /css/site.css?v=3f2a9c1b0d. Browsers can then keep files for a year, and a changed file is
// picked up immediately because its address changes.
// A file that does not exist throws, so a broken image reference stops the deploy instead of going live.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isProd } = require('./config');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const cache = new Map();

function fingerprint(urlPath) {
  const file = path.join(PUBLIC_DIR, urlPath);
  if (!file.startsWith(PUBLIC_DIR)) throw new Error(`Asset path escapes the public folder: ${urlPath}`);
  let contents;
  try {
    contents = fs.readFileSync(file);
  } catch {
    throw new Error(`Missing asset: public${urlPath}`);
  }
  return crypto.createHash('sha1').update(contents).digest('hex').slice(0, 10);
}

function asset(urlPath) {
  if (isProd && cache.has(urlPath)) return cache.get(urlPath);
  const versioned = `${urlPath}?v=${fingerprint(urlPath)}`;
  cache.set(urlPath, versioned);
  return versioned;
}

/** Cache headers for express.static. */
function setStaticHeaders(res, filePath) {
  const versioned = typeof res.req?.query?.v === 'string';
  const isFont = filePath.includes(`${path.sep}fonts${path.sep}`);
  if (versioned || isFont) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}

module.exports = { PUBLIC_DIR, asset, setStaticHeaders };
