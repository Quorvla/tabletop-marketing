// General questions shown on the home page and the services page.
// Service-specific questions live with each service in services.js.

const site = require('./site');

module.exports = [
  {
    q: 'How much does it cost?',
    a: 'Website Design is $275, ad management starts at $200 a month, social media management starts at $100 a month, and a Google Business Profile cleanup is $99. Anything else is quoted as a custom plan before any work starts.',
  },
  {
    q: 'How long does it take?',
    a: 'Most Google Business Profile projects are done in 2–3 business days from when we get your details and photos. A one-page website goes live in 7 business days or less.',
  },
  {
    q: 'What do you need from me?',
    a: 'Your business details and up to 5 photos, sent by text, email or Google Drive. No visit is needed.',
  },
  {
    q: 'What is not included?',
    a: 'It depends on the package. Each one lists what is not included, and any add-ons, on our services and pricing page.',
  },
  {
    q: 'Can you guarantee I will rank first on Google?',
    a: 'No, and nobody honestly can. Google decides where listings appear. What we deliver is the work itself: a complete, accurate and active profile, which Google says makes a business more likely to show up in local search results.',
  },
  {
    q: 'Which areas do you serve?',
    a: `We work remotely with local businesses in ${site.serviceArea.label}. If you are somewhere else, send us a message and we will tell you if we can help.`,
  },
  {
    q: 'What happens on the free consultation?',
    a: `It is a ${site.consultation.minutes}-minute conversation about your business and what you want to fix. You leave knowing what we would do and what it costs. There is no obligation to buy.`,
  },
];
