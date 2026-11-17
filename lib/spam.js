// Spam protection for the public forms, with no third-party scripts and no puzzles for real visitors.
//
// Layers:
// 1. Honeypot: a field people never see. Anything that fills it is a bot.
// 2. Timed token: the page asks the server for a signed timestamp. A form sent faster than a person
//    could fill it in, or sent without a valid token, is rejected.
// 3. Rate limit: a cap on how many messages one address can send in a short window.
// 4. A plain question for the rare visitor with JavaScript switched off.

const crypto = require('crypto');

const SECRET = process.env.FORM_SECRET || crypto.randomBytes(32).toString('hex');
const MIN_AGE_MS = 2500;
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

const HONEYPOT_FIELD = 'contact_me_by_fax';
const CHALLENGE = { field: 'human_check', question: 'What is 3 + 4?', answers: ['7', 'seven'] };

function sign(timestamp) {
  return crypto.createHmac('sha256', SECRET).update(String(timestamp)).digest('base64url').slice(0, 32);
}

function issueToken(now = Date.now()) {
  return `${now}.${sign(now)}`;
}

// Tokens are single-use once a message has been saved.
const usedTokens = new Map();

/** @returns {'ok'|'missing'|'invalid'|'too_fast'|'expired'|'used'} */
function checkToken(token, now = Date.now()) {
  if (typeof token !== 'string' || !token) return 'missing';
  const [rawTimestamp, signature, ...rest] = token.split('.');
  const timestamp = Number(rawTimestamp);
  if (rest.length || !signature || !Number.isSafeInteger(timestamp)) return 'invalid';

  const expected = sign(timestamp);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) return 'invalid';

  const age = now - timestamp;
  if (age < MIN_AGE_MS) return 'too_fast';
  if (age > MAX_AGE_MS) return 'expired';
  if (usedTokens.has(token)) return 'used';
  return 'ok';
}

function markTokenUsed(token, now = Date.now()) {
  usedTokens.set(token, now + MAX_AGE_MS);
}

function isHoneypotFilled(body) {
  return typeof body?.[HONEYPOT_FIELD] === 'string' && body[HONEYPOT_FIELD].trim() !== '';
}

function isChallengeAnswered(body) {
  const answer = String(body?.[CHALLENGE.field] || '').trim().toLowerCase();
  return CHALLENGE.answers.includes(answer);
}

/** A small in-memory rate limiter: at most `max` hits per `windowMs` for each key. */
function createRateLimiter({ windowMs, max }) {
  const hits = new Map();

  function prune(now) {
    for (const [key, times] of hits) {
      const recent = times.filter((t) => now - t < windowMs);
      if (recent.length) hits.set(key, recent);
      else hits.delete(key);
    }
  }

  return {
    /** Records a hit and returns true if it is allowed. */
    take(key, now = Date.now()) {
      const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) prune(now);
      return true;
    },
    reset() {
      hits.clear();
    },
  };
}

// Housekeeping so the single-use list cannot grow without limit.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [token, expires] of usedTokens) if (expires < now) usedTokens.delete(token);
}, 10 * 60 * 1000);
cleanup.unref();

/** The visitor's address. Render sits behind Cloudflare, which sets CF-Connecting-IP itself. */
function clientIp(req) {
  return String(req.headers['cf-connecting-ip'] || req.ip || 'unknown');
}

module.exports = {
  HONEYPOT_FIELD,
  CHALLENGE,
  MIN_AGE_MS,
  MAX_AGE_MS,
  issueToken,
  checkToken,
  markTokenUsed,
  isHoneypotFilled,
  isChallengeAnswered,
  createRateLimiter,
  clientIp,
};
