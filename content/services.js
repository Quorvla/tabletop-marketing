// The service catalogue.
// Each entry here becomes: a card on the home page, a section on /services, its own page at
// /services/<slug>, an option in the consultation form, an entry in the sitemap and search-engine markup.
// To add a service, copy one entry and change the text. No other file needs to be touched.
//
// House rules for this file:
// - Only describe what is really offered. No invented extras.
// - "outcomes" says what a client can expect and never promises rankings, calls or sales.

module.exports = [
  {
    slug: 'google-business-profile',
    name: 'Online Presence Starter',
    kind: 'Google Business Profile cleanup',
    illustration: 'profile',
    price: 99,
    priceTerms: 'One-time. Paid upfront.',
    turnaround: '2–3 business days',
    updated: '2026-11-15',

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
    name: 'Simple Business Website',
    kind: 'One-page website design',
    illustration: 'browser',
    price: 275,
    priceTerms: 'One-time.',
    turnaround: 'About a week',
    updated: '2026-11-15',

    teaser:
      'A clean one-page website with your hours, your menu or services, your photos, your contact details and a map. Built and launched in about a week.',
    highlights: [
      'One clean page that reads well on a phone',
      'Your hours, menu or services, and photos',
      'Contact details and an embedded map',
      'Built and launched in about a week',
    ],

    seo: {
      title: 'One-Page Website Design for Small Business, $275 | Quorvia',
      description:
        'A simple one-page website for your local business for $275. Your hours, services, photos, contact details and a map, built and launched in about a week.',
    },

    hero: {
      heading: 'A simple one-page website for your business',
      lead:
        'Everything a customer wants to know on one clean page: when you are open, what you offer, what it looks like, how to reach you and where to find you. Built and launched in about a week.',
    },

    whatItIs: [
      'A one-page website is a single, scrollable page that answers the questions customers ask most. When are you open? What do you offer? What does it look like? How do I reach you?',
      'We design and build yours, add your contact details and a map, and launch it in about a week. It gives your Google listing, your social profiles and your printed materials one professional place to point to.',
    ],

    problems: [
      'You have no website, so people who look you up find nothing of yours to click.',
      'Your only online home is a social media page.',
      'The website button on your Google listing is empty.',
      'Your current site is out of date or hard to read on a phone.',
    ],

    included: [
      {
        title: 'A single-page website',
        text: 'Your business hours, your menu or services and your photos on one clean page that reads well on a phone.',
      },
      {
        title: 'Contact info and a map',
        text: 'Your phone number, your address and an embedded map, so customers can reach you and find you.',
      },
      {
        title: 'Built and launched in about a week',
        text: 'We handle the build from the first draft to the day it goes live.',
      },
    ],
    notIncluded: ['Extra pages', 'Online ordering, booking or payment systems', 'Taking new photos'],
    notIncludedNote: 'Need one of these? Tell us and we will follow up with a custom plan.',

    steps: [
      {
        title: 'Tell us about your business',
        text: 'Share your hours, your menu or services, your photos and your contact details.',
      },
      {
        title: 'We design and build it',
        text: 'We put together your one-page site, with your contact info and a map.',
      },
      {
        title: 'You take a look',
        text: 'You see the site before it goes live, so anything that is off can be fixed first.',
      },
      {
        title: 'We launch it',
        text: 'Your site goes live, about a week after we have your details.',
      },
    ],

    benefits: [
      {
        title: 'One place for the basics',
        text: 'Hours, services, photos and contact details in one spot, instead of scattered across social posts.',
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
        text: 'One page, one price, live in about a week.',
      },
    ],

    outcomes: {
      expect: [
        'A live one-page website in about a week.',
        'Your hours, services, photos, contact details and a map, all in one place.',
        'A link you can add to your Google listing and social profiles.',
      ],
      cannot:
        'A website on its own does not guarantee more customers or a particular position on Google. It gives people who are already looking for you a clear, professional place to land.',
    },

    faqs: [
      {
        q: 'What do you need from me?',
        a: 'Your business hours, your menu or list of services, the photos you want to use and your contact details. We go through it together on your free consultation.',
      },
      {
        q: 'Can I have more than one page?',
        a: 'This package is a single page. If you need more, tell us what you have in mind and we will follow up with a custom plan.',
      },
      {
        q: 'What about a domain name and hosting?',
        a: 'We walk you through the options on your free consultation, before you commit to anything.',
      },
      {
        q: 'Will it work on phones?',
        a: 'Yes. The page is designed to read well on phones, tablets and computers.',
      },
    ],
  },
];
