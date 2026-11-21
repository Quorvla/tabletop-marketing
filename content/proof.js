// Numbers, testimonials and portfolio pieces shown on the site.
//
// THE RULE FOR THIS FILE: nothing invented, ever.
// - "facts" are promises about our own service, so they are true by definition.
// - "research" figures must come from a named source that was opened and checked on the date given.
// - "testimonials" are the client's own words, added only with their permission.
// - "portfolio" is real client work, added only with the client's permission.
// A section with an empty list is simply not shown on the site.

module.exports = {
  facts: [
    { value: '$99', label: 'Flat price for a Google profile cleanup' },
    { value: '2–3', unit: 'days', label: 'Business days from details to done' },
    { value: '7', unit: 'days', label: 'Business days or less to launch a website' },
    { value: '24–48', unit: 'hrs', label: 'Business hours to hear back from us' },
  ],

  research: {
    sourceName: 'Google Business Profile Help',
    sourceTitle: 'Complete your Business Profile on Google',
    sourceUrl: 'https://support.google.com/business/answer/10515606',
    checked: '2026-11-15',
    items: [
      {
        value: '2.7×',
        label: 'more likely to be seen as reputable, when a business has a complete profile on Google Search and Maps',
      },
      { value: '70%', label: 'more likely to get a visit, when a business has a complete profile' },
      { value: '50%', label: 'more likely to be considered for a purchase, when a business has a complete profile' },
    ],
  },

  // Example: { quote: 'Their exact words.', name: 'First name L.', business: 'Business name', location: 'Town, ON' }
  testimonials: [],

  // Example: { name: 'Business name', kind: 'One-page website', summary: 'One sentence on what was built.',
  //            url: 'https://example.com', image: '/images/portfolio/business.webp', imageAlt: 'Describe the screenshot' }
  portfolio: [],
};
