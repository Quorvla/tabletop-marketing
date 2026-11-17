// General questions shown on the home page and the services page.
// Service-specific questions live with each service in services.js.

const site = require('./site');

module.exports = [
  {
    q: 'How much does it cost?',
    a: 'The Online Presence Starter is $99 and a Simple Business Website is $275. Anything outside those two packages is quoted as a custom plan before any work starts.',
  },
  {
    q: 'Do I have to sign a contract?',
    a: 'No. You pay for the package and get the work, with no ongoing commitment.',
  },
  {
    q: 'How long does it take?',
    a: 'Most Google Business Profile projects are done in 2–3 business days from when we get your details and photos. A one-page website takes about a week.',
  },
  {
    q: 'What do you need from me?',
    a: 'Your business details and up to 5 photos, sent by text, email or Google Drive. No visit is needed.',
  },
  {
    q: 'What is not included?',
    a: 'Taking new photos, ongoing monthly management, social media content and ad management. Both packages are one-time projects, and we are happy to talk about more afterward.',
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
