// The service catalogue.
// Each entry here becomes: a card on the home page, a section on /services, its own page at
// /services/<slug>, an option in the consultation form, an entry in the sitemap and search-engine markup.
// To add a service, copy one entry and change the text. No other file needs to be touched.
//
// House rules for this file:
// - Only describe what is really offered. No invented extras.
// - "outcomes" says what a client can expect and never promises rankings, calls or sales.

const services = [
  {
    slug: 'google-business-profile',
    name: 'Online Presence Starter',
    kind: 'Google Business Profile cleanup',
    illustration: 'profile',
    price: 99,
    priceUnit: 'one-time',
    priceTerms: 'One-time. Paid upfront.',
    turnaround: '2–3 business days',
    updated: '2026-11-15',

    card: {
      name: 'Google Profile Cleanup',
      description: 'A one-time cleanup of your Google Business Profile, so what people see on Google Search and Maps is accurate, complete and active.',
      included: [
        'Hours, categories, menu or website link and description fixed',
        'Up to 5 photos added (you send them by text, email or Drive)',
        'Professional replies to up to 5 recent reviews',
        'One Google Post published',
        'A short follow-up report on what was fixed and what is next',
        'Done remotely in 2–3 business days',
      ],
      notIncluded: 'Taking new photos, ongoing monthly management, social content, ad management.',
      bestFor: 'Businesses whose Google listing is out of date, incomplete or ignored.',
      button: 'Fix My Google Profile',
    },

    teaser:
      'A one-time cleanup of your Google Business Profile, so the listing people see on Google Search and Maps is accurate, complete and active.',
    highlights: [
      'Hours, categories, links and description fixed',
      'Up to 5 photos added',
      'Up to 5 recent reviews answered',
      'One Google Post published',
      'A short report on what changed',
    ],

    seo: {
      title: 'Google Business Profile Cleanup, $99 | Quorvia Marketing',
      description:
        'A one-time Google Business Profile cleanup for $99. Accurate hours, better photos, answered reviews and a fresh post, done remotely in 2–3 business days.',
    },

    hero: {
      heading: 'Google Business Profile cleanup for local businesses',
      lead:
        'When someone looks you up on Google or Maps, your profile is the first thing they see. We make sure it is accurate, complete and active. One price, one time, done in 2–3 business days.',
    },

    whatItIs: [
      'Your Google Business Profile is the free listing that appears when people look you up on Google Search or Google Maps. It shows your hours, photos, reviews, phone number and directions.',
      'The Online Presence Starter is a one-time cleanup of that listing. We correct what is wrong, fill in what is missing, answer your recent reviews and publish a fresh post. Then we send you a short report on what changed and what to do next.',
    ],

    problems: [
      'Your listing shows the wrong hours, an old phone number or no website link.',
      'Your business sits in the wrong category, so it does not appear for what you actually offer.',
      'Your photos are old, dark or missing.',
      'Reviews have gone unanswered, including the unfair ones.',
      'The profile looks abandoned, with no description and no recent posts.',
    ],

    included: [
      {
        title: 'Profile cleanup',
        text: 'We fix your hours, categories, menu or website link and business description. No description yet? We write one from scratch.',
      },
      {
        title: 'Up to 5 photos added',
        text: 'Send them by text, email or Google Drive and we add them to your profile.',
      },
      {
        title: 'Up to 5 review responses',
        text: 'Professional replies written for your most recent reviews.',
      },
      {
        title: 'One Google Post',
        text: 'A fresh post published on your profile, such as an offer, an update or an announcement.',
      },
      {
        title: 'Follow-up report',
        text: 'A short summary of what was fixed and what we suggest next.',
      },
    ],
    notIncluded: ['Taking new photos', 'Ongoing monthly management', 'Social media content', 'Ad management'],

    steps: [
      {
        title: 'Send us your details',
        text: 'Your business info and up to 5 photos, by text, email or Google Drive. No visit needed.',
      },
      {
        title: 'We fix your profile',
        text: 'We clean up the listing, answer your recent reviews and publish a Google Post.',
      },
      {
        title: 'Get your report',
        text: 'A short report on what was fixed and what comes next, within 2–3 business days.',
      },
    ],

    benefits: [
      {
        title: 'Customers get the right information',
        text: 'Correct hours, a working phone number and the right links mean fewer wasted trips and missed calls.',
      },
      {
        title: 'You look as good online as you do in person',
        text: 'Fresh photos, a clear description and answered reviews show people a business that is open and paying attention.',
      },
      {
        title: 'It is done for you',
        text: 'Everything happens remotely. Your part is one message with your details and photos.',
      },
      {
        title: 'You know what to do next',
        text: 'The report gives you a plain-language list of what changed and what is worth doing after.',
      },
    ],

    outcomes: {
      expect: [
        'A complete, accurate and active profile within 2–3 business days of sending your details.',
        'A short written report showing what was fixed.',
        'Clear next steps you can act on yourself or hand to us.',
      ],
      research: {
        text: 'Google reports that customers are 2.7 times more likely to consider a business reputable when it has a complete Business Profile on Google Search and Maps.',
        sourceName: 'Google Business Profile Help',
        sourceUrl: 'https://support.google.com/business/answer/10515606',
      },
      cannot:
        'We do not promise a specific ranking, number of calls or number of new customers. Google decides where listings appear, and results depend on your location, your competition and your reviews.',
    },

    faqs: [
      {
        q: 'Do you need to visit my business?',
        a: 'No. The whole service is remote. You send your details and photos by text, email or Google Drive and we do the rest.',
      },
      {
        q: 'Will you take new photos for me?',
        a: 'No. Photography is not part of this package. You send up to 5 photos you already have and we add them to your profile.',
      },
      {
        q: 'Is there a monthly fee after the cleanup?',
        a: 'No. It is a one-time service for $99. Ongoing management is not included, and you are never signed up for anything automatically.',
      },
      {
        q: 'Can you guarantee I will rank first on Google?',
        a: 'No, and nobody honestly can. Google decides where listings appear. What we deliver is the work itself: a complete, accurate and active profile.',
      },
      {
        q: 'When do I pay?',
        a: 'The $99 is paid upfront, before the work begins.',
      },
    ],
  },

  {
    slug: 'website-design',
    name: 'Website Design',
    kind: 'One-page website',
    illustration: 'browser',
    price: 275,
    priceUnit: 'one-time',
    priceTerms: 'One-time.',
    turnaround: '7 business days or less',
    updated: '2026-11-21',

    card: {
      description: 'A clean, professional website that turns visitors into calls and bookings.',
      included: [
        'One-page, mobile-friendly website (Home, Services, About, Reviews, Contact sections)',
        'Click-to-call button, contact form and Google Map',
        'Business hours, service list and photos',
        'Basic local SEO setup',
        'Connected to your Google Business Profile',
        '1 round of revisions',
        'Live in 7 business days or less',
      ],
      notIncluded: 'Extra pages ($50/page), copywriting beyond light edits, online booking or ordering systems, domain name.',
      addOn: 'Optional care plan: $25/mo for hosting, updates, backups and small edits.',
      bestFor: 'Businesses with no website, or an outdated one that doesn’t bring in calls.',
      button: 'Get My Website',
    },

    teaser: 'A clean, professional website that turns visitors into calls and bookings.',
    highlights: [
      'One-page, mobile-friendly website',
      'Click-to-call button, contact form and Google Map',
      'Basic local SEO, connected to your Google Business Profile',
      'Live in 7 business days or less',
    ],

    seo: {
      title: 'One-Page Website Design for Small Business, $275 | Quorvia',
      description:
        'A one-page, mobile-friendly website for your local business for $275, with click-to-call, a contact form, a map and basic local SEO. Live in 7 business days or less.',
    },

    hero: {
      heading: 'A one-page website for your business',
      lead:
        'A clean, professional website that turns visitors into calls and bookings: your services, hours, photos, reviews and contact details on one page. Live in 7 business days or less.',
    },

    whatItIs: [
      'A one-page website is a single, scrollable page that answers the questions customers ask most. What do you offer? When are you open? What do other customers say? How do I reach you?',
      'We design and build yours with Home, Services, About, Reviews and Contact sections, add a click-to-call button, a contact form and a Google Map, and connect it to your Google Business Profile. It goes live in 7 business days or less.',
    ],

    problems: [
      'You have no website, so people who look you up find nothing of yours to click.',
      'Your only online home is a social media page.',
      'The website button on your Google listing is empty.',
      'Your current site is out of date, hard to read on a phone, or does not bring in calls.',
    ],

    included: [
      {
        title: 'A one-page, mobile-friendly website',
        text: 'Home, Services, About, Reviews and Contact sections on one page that reads well on any phone.',
      },
      {
        title: 'Click-to-call, a contact form and a map',
        text: 'A click-to-call button, a contact form and a Google Map, so customers can reach you and find you.',
      },
      {
        title: 'Your hours, services and photos',
        text: 'Your business hours, your service list and your photos.',
      },
      {
        title: 'Basic local SEO setup',
        text: 'The basics that help search engines understand what you do and where, and a link to your Google Business Profile.',
      },
      {
        title: '1 round of revisions',
        text: 'You see the site before it goes live, and we make one round of changes.',
      },
      {
        title: 'Live in 7 business days or less',
        text: 'We handle the build from the first draft to the day it goes live.',
      },
    ],
    notIncluded: [
      'Extra pages ($50/page)',
      'Copywriting beyond light edits',
      'Online booking or ordering systems',
      'Domain name',
    ],
    notIncludedNote: 'Optional care plan: $25/mo for hosting, updates, backups and small edits.',

    steps: [
      {
        title: 'Tell us about your business',
        text: 'Share your services, hours, photos, reviews and contact details.',
      },
      {
        title: 'We design and build it',
        text: 'We put together your one-page site, with click-to-call, a contact form and a map.',
      },
      {
        title: 'You take a look',
        text: 'You see the site before it goes live, and we make one round of revisions.',
      },
      {
        title: 'We launch it',
        text: 'Your site goes live in 7 business days or less.',
      },
    ],

    benefits: [
      {
        title: 'Built to bring in calls',
        text: 'A click-to-call button and a contact form on every phone, so interested visitors can reach you right away.',
      },
      {
        title: 'Somewhere to send people',
        text: 'A link for your Google listing, your social profiles, your business cards and your signage.',
      },
      {
        title: 'A professional first impression',
        text: 'A clean, modern page that looks right on phones, tablets and computers.',
      },
      {
        title: 'Fast and simple',
        text: 'One page, one price, live in 7 business days or less.',
      },
    ],

    outcomes: {
      expect: [
        'A live one-page website in 7 business days or less.',
        'Your services, hours, photos, reviews, contact details and a map, all in one place.',
        'A website you own, connected to your Google Business Profile.',
      ],
      cannot:
        'A website on its own does not guarantee more customers or a particular position on Google. It gives people who are already looking for you a clear, professional place to land.',
    },

    faqs: [
      {
        q: 'What do you need from me?',
        a: 'Your business hours, your list of services, the photos you want to use and your contact details. We go through it together on your free consultation.',
      },
      {
        q: 'Can I have more than one page?',
        a: 'Yes. Extra pages are $50 each.',
      },
      {
        q: 'Is the domain name included?',
        a: 'No. The domain name is not included in the $275.',
      },
      {
        q: 'Who looks after the site once it is live?',
        a: 'You can, or you can add the optional care plan: $25 a month for hosting, updates, backups and small edits.',
      },
      {
        q: 'Who owns the website?',
        a: 'You do. You own your website, accounts and content.',
      },
    ],
  },

  {
    slug: 'ad-management',
    name: 'Ad Management',
    kind: 'Facebook, Instagram or Google ads',
    page: false,
    price: 200,
    pricePrefix: 'Starting at',
    priceUnit: '/month',
    priceTerms: 'Starting at, per month.',

    card: {
      description: 'Targeted ads that put your business in front of local customers ready to buy.',
      included: [
        'Setup of one ad platform (Facebook/Instagram or Google)',
        '1 campaign with up to 3 ad variations',
        'Local targeting by location, age and interests',
        'Ad copy and graphics created for you',
        'Weekly performance checks and adjustments',
        'Monthly report showing calls, messages, clicks and cost per lead',
      ],
      notIncluded: 'Ad spend, paid directly to Google or Meta (we recommend $150-300/month to start).',
      addOn: 'Second platform +$100/month. 3-month minimum.',
      bestFor: 'Businesses that want more calls and bookings quickly.',
      button: 'Start Getting Leads',
    },

    teaser: 'Targeted ads that put your business in front of local customers ready to buy.',
    highlights: [
      'One ad platform set up: Facebook/Instagram or Google',
      'Ad copy and graphics created for you',
      'Weekly performance checks and adjustments',
      'Monthly report on calls, messages, clicks and cost per lead',
    ],
  },

  {
    slug: 'social-media',
    name: 'Social Media Management',
    kind: 'Facebook or Instagram',
    page: false,
    price: 100,
    pricePrefix: 'Starting at',
    priceUnit: '/month',
    priceTerms: 'Starting at, per month.',

    card: {
      description: 'A consistent, professional presence so customers trust you before they call.',
      included: [
        '1 platform (Facebook or Instagram)',
        '6 branded posts per month',
        'Captions and hashtags written for you',
        'Posts scheduled in advance with monthly calendar approval',
        'Profile cleanup (bio, links, contact buttons)',
        'Monthly reach and engagement summary',
      ],
      notIncluded: 'Photo shoots, video/Reels, daily comment replies.',
      addOn: 'Second platform +$75/month. You send photos monthly; we design the posts.',
      bestFor: 'Businesses that post rarely or not at all.',
      button: 'Grow My Socials',
    },

    teaser: 'A consistent, professional presence so customers trust you before they call.',
    highlights: [
      '1 platform: Facebook or Instagram',
      '6 branded posts per month',
      'Captions and hashtags written for you',
      'Monthly reach and engagement summary',
    ],
  },
];

// Pricing-page order: the three main services first, the Google profile cleanup as the fourth card.
const ORDER = ['website-design', 'ad-management', 'social-media', 'google-business-profile'];
services.sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

for (const service of services) {
  service.hasPage = service.page !== false;
  service.url = service.hasPage ? `/services/${service.slug}` : `/services#${service.slug}`;
}

module.exports = services;
