// Form submissions.
//
// POST /api/leads            used by the site's JavaScript (the normal path)
// POST /contact              plain HTML fallback for visitors without JavaScript
// POST /free-consultation    plain HTML fallback for visitors without JavaScript
// GET  /api/form-token       hands the page a signed, timed token (see lib/spam.js)

const express = require('express');
const { addSubmission } = require('../lib/store');
const { validateLead, toLeadRecord } = require('../lib/leads');
const { getPage, renderPage } = require('../lib/pages');
const { sendHtml } = require('../lib/http');
const spam = require('../lib/spam');

const router = express.Router();

// Five messages per ten minutes from one address is generous for a person and useless for a bot.
const limiter = spam.createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

function thankYouUrl(kind) {
  return `/thank-you?type=${kind === 'consultation' ? 'consultation' : 'contact'}`;
}

/** Blocks form posts sent from other websites. Browsers always send Origin on cross-site POSTs. */
function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

router.get('/api/form-token', (req, res) => {
  res.set('Cache-Control', 'no-store').json({ token: spam.issueToken(), minAgeMs: spam.MIN_AGE_MS });
});

router.post('/api/leads', async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  if (!req.is('json') || !isSameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'That request was not accepted.' });
  }
  if (!limiter.take(spam.clientIp(req))) {
    return res
      .status(429)
      .json({ ok: false, error: 'You have sent several messages in a short time. Please wait a few minutes and try again.' });
  }
  // Bots that fill the hidden field get a normal-looking success, and nothing is saved.
  if (spam.isHoneypotFilled(body)) {
    console.warn('Dropped a form submission that filled the hidden field.');
    return res.json({ ok: true, redirect: thankYouUrl(body.kind) });
  }

  const tokenState = spam.checkToken(body.token);
  if (tokenState !== 'ok') {
    return res.status(400).json({
      ok: false,
      code: tokenState === 'too_fast' ? 'token_wait' : 'token',
      error: 'Your session timed out. Please press send again.',
    });
  }

  const { ok, errors, values } = validateLead(body);
  if (!ok) {
    return res.status(422).json({ ok: false, error: 'Please check the highlighted fields.', errors });
  }

  try {
    await addSubmission(toLeadRecord(values));
    spam.markTokenUsed(body.token);
    res.json({ ok: true, redirect: thankYouUrl(values.kind) });
  } catch (err) {
    console.error('Failed to save a form submission:', err);
    res.status(500).json({ ok: false, error: 'Something went wrong saving your message. Please try again in a moment.' });
  }
});

/** The no-JavaScript path: the browser posts the form directly and gets a full page back. */
function htmlFormHandler(pagePath, kind) {
  const page = getPage(pagePath);

  return async (req, res) => {
    const body = { ...(req.body || {}), kind };

    const reshow = (status, form) =>
      sendHtml(res, renderPage(page, { form: { values: {}, errors: {}, showChallenge: true, failed: true, ...form } }), status);

    if (!isSameOrigin(req)) return reshow(403, { values: body, message: 'That request was not accepted. Please try again.' });
    if (!limiter.take(spam.clientIp(req))) {
      return reshow(429, {
        values: body,
        message: 'You have sent several messages in a short time. Please wait a few minutes and try again.',
      });
    }
    if (spam.isHoneypotFilled(body)) {
      console.warn('Dropped a form submission that filled the hidden field.');
      return res.redirect(303, thankYouUrl(kind));
    }

    const { ok, errors, values } = validateLead(body);
    if (!spam.isChallengeAnswered(body)) errors.human_check = 'Please answer the question so we know you are a person.';
    if (!ok || errors.human_check) {
      return reshow(422, { values, errors, message: 'Please check the highlighted fields and send again.' });
    }

    try {
      await addSubmission(toLeadRecord(values));
      res.redirect(303, thankYouUrl(kind));
    } catch (err) {
      console.error('Failed to save a form submission:', err);
      reshow(500, { values, message: 'Something went wrong saving your message. Please try again in a moment.' });
    }
  };
}

router.post('/contact', htmlFormHandler('/contact', 'contact'));
router.post('/free-consultation', htmlFormHandler('/free-consultation', 'consultation'));

module.exports = { router, limiter };
