// Run with: npm test
const test = require('node:test');
const assert = require('node:assert/strict');

const spam = require('../lib/spam');
const { validateLead, toLeadRecord } = require('../lib/leads');

test('a fresh token is rejected as too fast, then accepted, then single-use', () => {
  const issued = 1_000_000;
  const token = spam.issueToken(issued);
  assert.equal(spam.checkToken(token, issued + 500), 'too_fast');
  assert.equal(spam.checkToken(token, issued + spam.MIN_AGE_MS + 1), 'ok');
  spam.markTokenUsed(token);
  assert.equal(spam.checkToken(token, issued + spam.MIN_AGE_MS + 2), 'used');
});

test('missing, forged and expired tokens are rejected', () => {
  const issued = 2_000_000;
  const token = spam.issueToken(issued);
  assert.equal(spam.checkToken(undefined), 'missing');
  assert.equal(spam.checkToken('123.abc', issued + 5000), 'invalid');
  assert.equal(spam.checkToken(token.replace(/^\d+/, String(issued - 60_000)), issued + 5000), 'invalid');
  assert.equal(spam.checkToken(token, issued + spam.MAX_AGE_MS + 1), 'expired');
});

test('honeypot and the no-JavaScript question', () => {
  assert.equal(spam.isHoneypotFilled({ [spam.HONEYPOT_FIELD]: 'x' }), true);
  assert.equal(spam.isHoneypotFilled({ [spam.HONEYPOT_FIELD]: '  ' }), false);
  assert.equal(spam.isChallengeAnswered({ human_check: ' Seven ' }), true);
  assert.equal(spam.isChallengeAnswered({ human_check: '8' }), false);
});

test('rate limiter allows the cap, blocks the next, and recovers', () => {
  const limiter = spam.createRateLimiter({ windowMs: 1000, max: 2 });
  assert.equal(limiter.take('ip', 0), true);
  assert.equal(limiter.take('ip', 10), true);
  assert.equal(limiter.take('ip', 20), false);
  assert.equal(limiter.take('other', 20), true);
  assert.equal(limiter.take('ip', 1500), true);
});

test('contact form needs name, a valid email and a message', () => {
  const bad = validateLead({ kind: 'contact', name: '', email: 'nope', message: '' });
  assert.equal(bad.ok, false);
  assert.deepEqual(Object.keys(bad.errors).sort(), ['email', 'message', 'name']);
  const good = validateLead({ kind: 'contact', name: ' Ann  Lee ', email: 'ANN@Example.com', message: 'Hi' });
  assert.equal(good.ok, true);
  assert.equal(good.values.name, 'Ann Lee');
  assert.equal(good.values.email, 'ann@example.com');
});

test('consultation needs a business name but not a message; bad options are dropped', () => {
  assert.ok(validateLead({ kind: 'consultation', name: 'Ann Lee', email: 'a@b.co' }).errors.business);
  const ok = validateLead({ kind: 'consultation', name: 'Ann Lee', email: 'a@b.co', business: 'Cafe', service: 'made-up', phone: '705 555 0100' });
  assert.equal(ok.ok, true);
  assert.equal(ok.values.service, '');
  assert.ok(validateLead({ kind: 'contact', name: 'Ann Lee', email: 'a@b.co', message: 'x', phone: 'call me' }).errors.phone);
});

test('the stored record says what kind of request it was', () => {
  const { values } = validateLead({ kind: 'consultation', name: 'Ann Lee', email: 'a@b.co', business: 'Cafe', service: 'website-design', bestTime: 'morning' });
  const record = toLeadRecord(values, new Date('2026-01-01T00:00:00Z'));
  assert.equal(record.restaurant, 'Cafe');
  assert.equal(record.status, 'New Lead');
  assert.match(record.message, /Free consultation request/);
  assert.match(record.message, /Website Design/);
  assert.match(record.message, /Mornings/);
});
