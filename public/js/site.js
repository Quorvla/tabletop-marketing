/* Quorvia Marketing: browser behaviour.
   Everything here is an enhancement. With JavaScript off, the pages, the menu and the forms still work. */
(() => {
  'use strict';

  /* ---------- Analytics ----------
     Events always go to window.dataLayer. If Google Tag Manager or gtag.js is configured on the server
     they are picked up from there; if not, nothing is sent anywhere. */
  window.dataLayer = window.dataLayer || [];
  const adsLeadTarget = document.body.dataset.adsLead || '';

  function track(name, params = {}) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    else window.dataLayer.push({ event: name, ...params });
  }

  document.addEventListener('click', (event) => {
    const el = event.target instanceof Element ? event.target.closest('[data-cta], [data-contact], [data-booking-link]') : null;
    if (!el) return;
    if (el.dataset.cta) {
      track('cta_click', {
        cta_label: el.dataset.cta,
        cta_location: el.dataset.ctaLocation || '',
        link_url: el.getAttribute('href') || '',
      });
    } else if (el.dataset.contact) {
      track('contact_click', { method: el.dataset.contact });
    } else {
      track('booking_link_click', {});
    }
  });

  /* ---------- Mobile menu (a native <details>, so it opens without this script) ---------- */
  const menu = document.querySelector('.nav-mobile');
  if (menu) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  /* ---------- Scroll reveal ----------
     Only elements below the first screen are hidden and faded in, so nothing visible ever flickers. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealTargets.length && 'IntersectionObserver' in window && !reduceMotion) {
    const fold = window.innerHeight * 0.95;
    const belowFold = revealTargets.filter((el) => el.getBoundingClientRect().top > fold);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove('reveal--pending');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );
    for (const el of belowFold) {
      const position = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.transitionDelay = `${Math.min(position, 5) * 70}ms`;
      el.classList.add('reveal', 'reveal--pending');
      observer.observe(el);
    }
  }

  /* ---------- Forms ---------- */
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_PATTERN = /^[0-9+()\-.\s]{7,30}$/;
  const GENERIC_ERROR = 'Something went wrong on our side. Please try again in a moment.';
  const OFFLINE_ERROR = 'We could not reach the server. Please check your connection and try again.';

  const tokenState = { value: '', issuedAt: 0, minAgeMs: 2500, pending: null };

  function fetchToken() {
    if (tokenState.pending) return tokenState.pending;
    tokenState.pending = fetch('/api/form-token', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('token'))))
      .then((data) => {
        tokenState.value = data.token;
        tokenState.issuedAt = Date.now();
        tokenState.minAgeMs = Number(data.minAgeMs) || 2500;
      })
      .catch(() => {
        tokenState.value = '';
      })
      .finally(() => {
        tokenState.pending = null;
      });
    return tokenState.pending;
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

  /** Makes sure there is a token and that it is old enough for the server to accept. */
  async function readyToken(forceNew) {
    const tooOld = Date.now() - tokenState.issuedAt > 5 * 60 * 60 * 1000;
    if (forceNew || !tokenState.value || tooOld) await fetchToken();
    if (!tokenState.value) return '';
    await wait(tokenState.minAgeMs + 200 - (Date.now() - tokenState.issuedAt));
    return tokenState.value;
  }

  function fieldMessage(form, name) {
    const control = form.elements[name];
    if (!control) return '';
    const value = control.value.trim();
    const isConsult = form.dataset.kind === 'consultation';

    switch (name) {
      case 'name':
        if (!value) return 'Please enter your name.';
        if (value.length < 2) return 'Please enter your full name.';
        return '';
      case 'email':
        if (!value) return 'Please enter your email address.';
        if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address, like name@example.com.';
        return '';
      case 'business':
        return isConsult && !value ? 'Please enter your business name.' : '';
      case 'phone':
        return value && !PHONE_PATTERN.test(value) ? 'Please enter a valid phone number, or leave it blank.' : '';
      case 'message':
        return !isConsult && !value ? 'Please tell us how we can help.' : '';
      default:
        return '';
    }
  }

  function showFieldError(form, name, message) {
    const control = form.elements[name];
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (!control || !error) return;
    const field = control.closest('.field');
    error.textContent = message || '';
    error.hidden = !message;
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
    if (field) field.classList.toggle('field--invalid', Boolean(message));
  }

  function showAlert(form, message) {
    const alert = form.querySelector('[data-form-alert]');
    if (!alert) return;
    alert.querySelector('[data-form-alert-text]').textContent = message || '';
    alert.hidden = !message;
    if (message) alert.focus();
  }

  function setBusy(form, busy) {
    const button = form.querySelector('[data-submit]');
    const label = form.querySelector('[data-submit-label]');
    if (!button || !label) return;
    if (busy) {
      label.dataset.idle = label.dataset.idle || label.textContent;
      label.textContent = 'Sending…';
      button.setAttribute('aria-busy', 'true');
      button.setAttribute('aria-disabled', 'true');
    } else {
      label.textContent = label.dataset.idle || label.textContent;
      button.removeAttribute('aria-busy');
      button.removeAttribute('aria-disabled');
    }
  }

  async function postLead(payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        /* a non-JSON reply is handled as a generic error below */
      }
      return { status: res.status, data };
    } finally {
      clearTimeout(timer);
    }
  }

  function initLeadForm(form) {
    const kind = form.dataset.kind;
    const names = ['name', 'email', 'business', 'phone', 'message'];
    let sending = false;
    let started = false;

    form.noValidate = true; // this script shows the messages instead of the browser's pop-up bubbles

    // Links such as /free-consultation?service=website-design pre-select the service.
    const wanted = new URLSearchParams(window.location.search).get('service');
    if (wanted && form.elements.service) {
      const option = Array.from(form.elements.service.options).find((o) => o.value === wanted);
      if (option) form.elements.service.value = wanted;
    }

    form.addEventListener('focusin', () => {
      if (started) return;
      started = true;
      track('form_start', { form: kind });
    });

    for (const name of names) {
      const control = form.elements[name];
      if (!control) continue;
      control.addEventListener('blur', () => {
        if (control.value.trim() || control.getAttribute('aria-invalid')) showFieldError(form, name, fieldMessage(form, name));
      });
      control.addEventListener('input', () => {
        if (control.getAttribute('aria-invalid')) showFieldError(form, name, fieldMessage(form, name));
      });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;

      let firstInvalid = null;
      for (const name of names) {
        const message = fieldMessage(form, name);
        showFieldError(form, name, message);
        if (message && !firstInvalid) firstInvalid = form.elements[name];
      }
      if (firstInvalid) {
        showAlert(form, '');
        firstInvalid.focus();
        track('form_error', { form: kind, reason: 'validation' });
        return;
      }

      sending = true;
      showAlert(form, '');
      setBusy(form, true);

      const payload = { kind };
      new FormData(form).forEach((value, key) => {
        payload[key] = typeof value === 'string' ? value : '';
      });

      try {
        let result = null;
        for (let attempt = 0; attempt < 2; attempt += 1) {
          payload.token = await readyToken(attempt > 0);
          result = await postLead(payload);
          const tokenProblem = result.status === 400 && (result.data.code === 'token' || result.data.code === 'token_wait');
          if (!tokenProblem) break;
        }

        if (result.status === 200 && result.data.ok) {
          try {
            sessionStorage.setItem('qm_lead', JSON.stringify({ type: kind, service: payload.service || '', at: Date.now() }));
          } catch {
            /* private browsing: the visit still completes, only the analytics event is skipped */
          }
          window.location.assign(result.data.redirect || '/thank-you');
          return;
        }

        if (result.status === 422 && result.data.errors) {
          let first = null;
          for (const [name, message] of Object.entries(result.data.errors)) {
            showFieldError(form, name, message);
            if (!first && form.elements[name]) first = form.elements[name];
          }
          showAlert(form, result.data.error || 'Please check the highlighted fields.');
          if (first) first.focus();
        } else {
          showAlert(form, result.data.error || GENERIC_ERROR);
        }
        track('form_error', { form: kind, reason: `http_${result.status}` });
      } catch {
        showAlert(form, OFFLINE_ERROR);
        track('form_error', { form: kind, reason: 'network' });
      }

      sending = false;
      setBusy(form, false);
    });
  }

  const leadForms = document.querySelectorAll('[data-lead-form]');
  if (leadForms.length) {
    leadForms.forEach(initLeadForm);
    // Ask for the timed token early, so it is ready long before anyone presses send.
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => fetchToken(), { timeout: 2000 });
    else setTimeout(fetchToken, 800);
  }

  /* ---------- Thank-you page: report the lead once ---------- */
  if (document.querySelector('[data-thank-you]')) {
    try {
      const raw = sessionStorage.getItem('qm_lead');
      if (raw) {
        sessionStorage.removeItem('qm_lead');
        const lead = JSON.parse(raw);
        if (lead && Date.now() - lead.at < 10 * 60 * 1000) {
          track('generate_lead', { lead_type: lead.type, service: lead.service || '' });
          if (lead.type === 'consultation') track('book_consultation', { service: lead.service || '' });
          if (adsLeadTarget && typeof window.gtag === 'function') {
            window.gtag('event', 'conversion', { send_to: adsLeadTarget });
          }
        }
      }
    } catch {
      /* storage unavailable: nothing to report */
    }
  }
})();
