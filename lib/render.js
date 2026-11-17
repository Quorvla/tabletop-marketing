// Template engine setup. Pages live in /views as plain HTML with a little templating,
// and share one layout, one header and one footer.

const path = require('path');
const nunjucks = require('nunjucks');
const { isProd, site, tracking } = require('./config');
const { asset } = require('./assets');
const { logoMarkSvg } = require('./brand');

const env = nunjucks.configure(path.join(__dirname, '..', 'views'), {
  autoescape: true,
  noCache: !isProd,
  throwOnUndefined: true, // a typo in a template stops the deploy instead of printing a blank
  trimBlocks: true,
  lstripBlocks: true,
});

env.addGlobal('site', site);
env.addGlobal('tracking', tracking);
env.addGlobal('asset', asset);
env.addGlobal('currentYear', () => new Date().getFullYear());
env.addGlobal('logoMark', (className) => new nunjucks.runtime.SafeString(logoMarkSvg(className)));

// Safe to place inside a <script type="application/ld+json"> block.
env.addFilter('jsonld', (value) => JSON.stringify(value).replace(/</g, '\\u003c'));
env.addFilter('money', (amount) => `$${Number(amount).toLocaleString('en-CA')}`);
env.addFilter('longDate', (isoDate) =>
  new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
);

function render(view, locals) {
  return env.render(view, locals);
}

module.exports = { render };
