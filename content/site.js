// Site-wide facts about the business.
// Change a value here and every page, the sitemap and the search-engine markup update with it.

module.exports = {
  name: 'Quorvia Marketing',
  shortName: 'Quorvia',
  tagline: 'Get found. Get seen. Get booked.',
  description:
    'Quorvia Marketing fixes Google Business Profiles and builds simple websites for local businesses. Fixed prices, done in days, no contracts.',

  language: 'en-CA',
  currency: 'CAD',

  // Where the business takes clients. Shown in copy and sent to search engines as the service area.
  serviceArea: {
    label: 'Lindsay, Kawartha Lakes and across Ontario',
    short: 'Lindsay, Kawartha Lakes and Ontario',
    places: [
      { type: 'City', name: 'Lindsay' },
      { type: 'AdministrativeArea', name: 'Kawartha Lakes' },
      { type: 'AdministrativeArea', name: 'Ontario' },
    ],
  },

  // Public contact details, shown as clickable links site-wide. Set one to null to hide it.
  // These can also be changed without a code change through CONTACT_EMAIL and CONTACT_PHONE.
  contact: {
    email: 'quorviamarketing@gmail.com',
    phone: '705-821-1351',
  },

  replyTime: '24–48 business hours',

  consultation: {
    minutes: 30,
    // Optional link to an online calendar (Calendly, Google Calendar appointments).
    // Can also be set through BOOKING_URL. Leave null to take requests through the form only.
    bookingUrl: null,
  },

  // Social profiles. Add more as { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/yourhandle' }
  social: [{ name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/people/Quorvia-marketing/61596696022344/' }],

  // Optional founder note for the About page. Leave null until there is a real name and photo.
  // Example: { name: 'Jane Doe', role: 'Founder', note: 'Two sentences in your own words.' }
  founder: null,
};
