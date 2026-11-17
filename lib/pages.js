// The page registry: every public page, its address, its search-engine title and description,
// and the data its template needs. Routes, the sitemap and the automated checks all read from here,
// so a page added to this list is wired up everywhere at once.

const { site } = require('./config');
const { render } = require('./render');
const schema = require('./schema');
const services = require('../content/services');
const faqs = require('../content/faqs');
const proof = require('../content/proof');
const { SERVICE_OPTIONS, TIME_OPTIONS, LIMITS } = require('./leads');
const { HONEYPOT_FIELD, CHALLENGE } = require('./spam');

const HOME = { name: 'Home', path: '/' };

const formLocals = {
  serviceOptions: SERVICE_OPTIONS,
  timeOptions: TIME_OPTIONS,
  limits: LIMITS,
  honeypotField: HONEYPOT_FIELD,
  challenge: CHALLENGE,
  form: { values: {}, errors: {}, showChallenge: false, failed: false },
};

function definePage({ path, view, title, description, updated, crumb, trail, noindex = false, locals = {}, extraSchema = [] }) {
  const canonical = `${site.url}${path}`;
  const breadcrumbTrail = trail || (path === '/' ? [HOME] : [HOME, { name: crumb, path }]);
  const page = { path, view, title, description, updated, canonical, noindex, trail: breadcrumbTrail };
  page.schema = schema.graph([
    schema.organization(),
    schema.website(),
    schema.webPage(page),
    schema.breadcrumbs(breadcrumbTrail),
    ...extraSchema.map((build) => build(page)),
  ]);
  page.locals = locals;
  return page;
}

const pages = [
  definePage({
    path: '/',
    view: 'pages/home.njk',
    title: 'Quorvia Marketing | Google Business Profile & Websites',
    description:
      'We fix Google Business Profiles and build simple websites for local businesses in Lindsay, Kawartha Lakes and across Ontario. From $99. No contracts.',
    updated: '2026-11-15',
    locals: { services, faqs, proof },
    extraSchema: [() => schema.faqPage(faqs)],
  }),

  definePage({
    path: '/services',
    view: 'pages/services.njk',
    crumb: 'Services',
    title: 'Local Marketing Services & Pricing | Quorvia Marketing',
    description:
      'Two fixed-price services for local businesses: a $99 Google Business Profile cleanup and a $275 one-page website. See what is included and how each works.',
    updated: '2026-11-15',
    locals: { services },
  }),

  ...services.map((service) =>
    definePage({
      path: `/services/${service.slug}`,
      view: 'pages/service.njk',
      trail: [HOME, { name: 'Services', path: '/services' }, { name: service.name, path: `/services/${service.slug}` }],
      title: service.seo.title,
      description: service.seo.description,
      updated: service.updated,
      locals: { service, otherServices: services.filter((s) => s.slug !== service.slug) },
      extraSchema: [(page) => schema.service(service, page.canonical), () => schema.faqPage(service.faqs)],
    })
  ),

  definePage({
    path: '/about',
    view: 'pages/about.njk',
    crumb: 'About',
    title: 'About Quorvia Marketing | Small, Remote, Fixed-Price',
    description:
      'Quorvia Marketing is a small, fully remote studio that helps local businesses get found online. Fixed prices, short timelines and no contracts.',
    updated: '2026-11-15',
    locals: { services },
  }),

  definePage({
    path: '/free-consultation',
    view: 'pages/consultation.njk',
    crumb: 'Free consultation',
    title: 'Book a Free 30-Minute Consultation | Quorvia Marketing',
    description:
      'Book a free 30-minute consultation with Quorvia Marketing. Tell us what you want to fix and leave knowing what we would do and what it costs. No obligation.',
    updated: '2026-11-15',
    locals: { ...formLocals },
  }),

  definePage({
    path: '/contact',
    view: 'pages/contact.njk',
    crumb: 'Contact',
    title: 'Contact Quorvia Marketing | Send Us a Message',
    description:
      'Questions about your Google Business Profile or a website? Send Quorvia Marketing a message and get a reply within 24–48 business hours.',
    updated: '2026-11-15',
    locals: { ...formLocals },
  }),

  definePage({
    path: '/thank-you',
    view: 'pages/thank-you.njk',
    crumb: 'Thank you',
    title: 'Thank You | Quorvia Marketing',
    description: 'Thanks for getting in touch with Quorvia Marketing. Here is what happens next.',
    updated: '2026-11-15',
    noindex: true,
    locals: { services },
  }),

  definePage({
    path: '/privacy',
    view: 'pages/privacy.njk',
    crumb: 'Privacy policy',
    title: 'Privacy Policy | Quorvia Marketing',
    description: 'How Quorvia Marketing collects, uses and protects the information you share through this website.',
    updated: '2026-11-15',
  }),

  definePage({
    path: '/terms',
    view: 'pages/terms.njk',
    crumb: 'Terms and conditions',
    title: 'Terms and Conditions | Quorvia Marketing',
    description: 'The terms that apply when you use the Quorvia Marketing website and services.',
    updated: '2026-11-15',
  }),
];

const notFoundPage = definePage({
  path: '/404',
  view: 'pages/404.njk',
  crumb: 'Page not found',
  title: 'Page Not Found | Quorvia Marketing',
  description: 'That page does not exist on the Quorvia Marketing website. Here are some places to go instead.',
  updated: '2026-11-15',
  noindex: true,
  locals: { services },
});

const byPath = new Map(pages.map((page) => [page.path, page]));

function getPage(path) {
  return byPath.get(path) || null;
}

/** Renders a page. `extra` overrides the page's default data (used to re-show a form with errors). */
function renderPage(page, extra = {}) {
  return render(page.view, { page, ...page.locals, ...extra });
}

module.exports = { pages, notFoundPage, getPage, renderPage };
