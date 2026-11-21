// Structured data (JSON-LD) that tells search engines what the business is, what it sells and where.
// Everything is built from the content files, so it can never drift from what the pages say.

const { site } = require('./config');

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

function areaServed() {
  return site.serviceArea.places.map((place) => ({ '@type': place.type, name: place.name }));
}

function organization() {
  const org = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    url: `${site.url}/`,
    logo: `${site.url}/images/logo-512.png`,
    description: site.description,
    slogan: site.tagline,
    areaServed: areaServed(),
    knowsAbout: ['Google Business Profile', 'Local SEO', 'Small business website design'],
  };
  if (site.contact.email) org.email = site.contact.email;
  if (site.contact.phone) org.telephone = site.contact.phoneHref.replace('tel:', '');
  if (site.contact.email || site.contact.phone) {
    org.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
      ...(site.contact.phone ? { telephone: org.telephone } : {}),
      ...(site.contact.email ? { email: site.contact.email } : {}),
    };
  }
  if (site.social.length) org.sameAs = site.social.map((s) => s.url);
  return org;
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${site.url}/`,
    name: site.name,
    inLanguage: site.language,
    publisher: { '@id': ORG_ID },
  };
}

function webPage(page) {
  return {
    '@type': 'WebPage',
    '@id': `${page.canonical}#webpage`,
    url: page.canonical,
    name: page.title,
    description: page.description,
    inLanguage: site.language,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    dateModified: page.updated,
  };
}

function breadcrumbs(trail) {
  if (!trail || trail.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path === '/' ? '/' : crumb.path}`,
    })),
  };
}

function service(svc, canonical) {
  return {
    '@type': 'Service',
    '@id': `${canonical}#service`,
    name: svc.name,
    serviceType: svc.kind,
    description: svc.teaser,
    url: canonical,
    provider: { '@id': ORG_ID },
    areaServed: areaServed(),
    offers: {
      '@type': 'Offer',
      url: canonical,
      price: svc.price.toFixed(2),
      priceCurrency: site.currency,
      availability: 'https://schema.org/InStock',
    },
  };
}

/** All services and their prices, for the pricing page. Monthly prices are marked as "from". */
function offerCatalog(services, canonical) {
  return {
    '@type': 'OfferCatalog',
    '@id': `${canonical}#catalog`,
    name: `${site.name} services and pricing`,
    itemListElement: services.map((svc) => ({
      '@type': 'Offer',
      url: `${site.url}${svc.url}`,
      itemOffered: { '@type': 'Service', name: svc.name, serviceType: svc.kind, provider: { '@id': ORG_ID }, areaServed: areaServed() },
      priceSpecification:
        svc.priceUnit === '/month'
          ? { '@type': 'UnitPriceSpecification', minPrice: svc.price.toFixed(2), priceCurrency: site.currency, unitText: 'month' }
          : { '@type': 'PriceSpecification', price: svc.price.toFixed(2), priceCurrency: site.currency },
    })),
  };
}

function faqPage(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

/** Wraps the pieces for one page into a single graph. */
function graph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}

module.exports = { organization, website, webPage, breadcrumbs, service, offerCatalog, faqPage, graph };
