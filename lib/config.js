// Runtime configuration. Everything that differs between your laptop and the live site is read here,
// from environment variables, so no secrets or tracking IDs ever live in the code.

const siteContent = require('../content/site');

const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
const port = Number(process.env.PORT) || 3000;

function trimUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

/** Read an optional setting and ignore it (with a warning) if it is not in the expected shape. */
function optional(name, pattern) {
  const raw = String(process.env[name] || '').trim();
  if (!raw) return null;
  if (!pattern.test(raw)) {
    console.warn(`[config] Ignoring ${name}: the value is not in the expected format.`);
    return null;
  }
  return raw;
}

const siteUrl = trimUrl(process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL) || `http://localhost:${port}`;

// --- Analytics and advertising. Nothing loads unless an ID is set. ---
const tracking = {
  gtmId: optional('GTM_ID', /^GTM-[A-Z0-9]{4,12}$/),
  ga4Id: optional('GA4_ID', /^G-[A-Z0-9]{6,14}$/),
  adsId: optional('GOOGLE_ADS_ID', /^AW-\d{6,14}$/),
  adsLeadLabel: optional('GOOGLE_ADS_LEAD_LABEL', /^[A-Za-z0-9_-]{6,40}$/),
  searchConsoleToken: optional('GOOGLE_SITE_VERIFICATION', /^[A-Za-z0-9_-]{20,100}$/),
};
if (tracking.gtmId && (tracking.ga4Id || tracking.adsId)) {
  console.warn('[config] GTM_ID is set, so GA4_ID and GOOGLE_ADS_ID are ignored. Add those tags inside Tag Manager instead.');
  tracking.ga4Id = null;
  tracking.adsId = null;
  tracking.adsLeadLabel = null;
}
tracking.mode = tracking.gtmId ? 'gtm' : tracking.ga4Id || tracking.adsId ? 'gtag' : 'off';
tracking.enabled = tracking.mode !== 'off';

// --- Public contact details ---
const email = optional('CONTACT_EMAIL', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/) || siteContent.contact.email || null;
const phone = String(process.env.CONTACT_PHONE || siteContent.contact.phone || '').trim() || null;

function phoneHref(display) {
  if (!display) return null;
  const digits = display.replace(/[^\d+]/g, '');
  if (/^\d{10}$/.test(digits)) return `tel:+1${digits}`;
  if (/^1\d{10}$/.test(digits)) return `tel:+${digits}`;
  return `tel:${digits}`;
}

const bookingUrl = optional('BOOKING_URL', /^https:\/\/[^\s"'<>]+$/) || siteContent.consultation.bookingUrl || null;

const site = {
  ...siteContent,
  url: siteUrl,
  contact: {
    email,
    emailHref: email ? `mailto:${email}` : null,
    phone,
    phoneHref: phoneHref(phone),
  },
  consultation: { ...siteContent.consultation, bookingUrl },
};

module.exports = { isProd, port, site, tracking };
