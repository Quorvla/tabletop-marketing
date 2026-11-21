// Validation for the public forms. The browser checks the same rules for a faster experience,
// but this file is the one that counts: nothing is saved unless it passes here.

const crypto = require('crypto');
const services = require('../content/services');

const KINDS = ['contact', 'consultation'];

const SERVICE_OPTIONS = [
  ...services.map((s) => ({ value: s.slug, label: `${s.name} (${s.kind})` })),
  { value: 'bundle', label: 'Website + 3 months of Social Media bundle' },
  { value: 'both', label: 'More than one' },
  { value: 'not-sure', label: 'Not sure yet' },
  { value: 'other', label: 'Something else' },
];

const TIME_OPTIONS = [
  { value: 'anytime', label: 'Any time' },
  { value: 'morning', label: 'Mornings' },
  { value: 'afternoon', label: 'Afternoons' },
  { value: 'evening', label: 'Evenings' },
];

const LIMITS = { name: 100, email: 200, business: 150, phone: 30, message: 2000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]{7,30}$/;

function clean(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function cleanMultiline(value) {
  return typeof value === 'string' ? value.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim() : '';
}

function labelFor(options, value) {
  const match = options.find((o) => o.value === value);
  return match ? match.label : '';
}

/**
 * Checks one form submission.
 * @returns {{ ok: boolean, errors: Record<string, string>, values: object }}
 */
function validateLead(input = {}) {
  const kind = KINDS.includes(input.kind) ? input.kind : 'contact';
  const values = {
    kind,
    name: clean(input.name),
    email: clean(input.email).toLowerCase(),
    business: clean(input.business),
    phone: clean(input.phone),
    service: clean(input.service),
    bestTime: clean(input.bestTime),
    message: cleanMultiline(input.message),
  };
  const errors = {};

  if (!values.name) errors.name = 'Please enter your name.';
  else if (values.name.length < 2) errors.name = 'Please enter your full name.';
  else if (values.name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;

  if (!values.email) errors.email = 'Please enter your email address.';
  else if (values.email.length > LIMITS.email || !EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Please enter a valid email address, like name@example.com.';
  }

  if (!values.business) {
    if (kind === 'consultation') errors.business = 'Please enter your business name.';
  } else if (values.business.length > LIMITS.business) {
    errors.business = `Please keep the business name under ${LIMITS.business} characters.`;
  }

  if (values.phone && !PHONE_PATTERN.test(values.phone)) {
    errors.phone = 'Please enter a valid phone number, or leave it blank.';
  }

  if (values.service && !SERVICE_OPTIONS.some((o) => o.value === values.service)) values.service = '';
  if (values.bestTime && !TIME_OPTIONS.some((o) => o.value === values.bestTime)) values.bestTime = '';

  if (!values.message) {
    if (kind === 'contact') errors.message = 'Please tell us how we can help.';
  } else if (values.message.length > LIMITS.message) {
    errors.message = `Please keep your message under ${LIMITS.message} characters.`;
  }

  return { ok: Object.keys(errors).length === 0, errors, values };
}

/** Turns a checked submission into the record the lead tracker stores. */
function toLeadRecord(values, now = new Date()) {
  const header = [values.kind === 'consultation' ? '[Free consultation request]' : '[Website message]'];
  const service = labelFor(SERVICE_OPTIONS, values.service);
  const bestTime = labelFor(TIME_OPTIONS, values.bestTime);
  if (service) header.push(`Interested in: ${service}`);
  if (bestTime) header.push(`Best time to reach: ${bestTime}`);

  return {
    id: crypto.randomUUID(),
    name: values.name,
    email: values.email,
    restaurant: values.business,
    phone: values.phone,
    message: `${header.join('\n')}\n\n${values.message || '(No message left.)'}`,
    status: 'New Lead',
    submittedAt: now.toISOString(),
  };
}

module.exports = { KINDS, SERVICE_OPTIONS, TIME_OPTIONS, LIMITS, validateLead, toLeadRecord };
