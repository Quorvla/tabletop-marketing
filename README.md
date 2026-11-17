# Quorvia Marketing website

Public marketing site, lead forms and a private lead tracker.
Live at https://quorvia-marketing.onrender.com

## Where things are

| You want to change | Edit |
| --- | --- |
| Phone, email, social links, service area | `content/site.js` |
| A service: price, what is included, FAQ | `content/services.js` |
| Home page questions | `content/faqs.js` |
| Testimonials, portfolio, statistics | `content/proof.js` |
| Page wording and layout | `views/pages/*.njk` |
| Header, footer, form, buttons | `views/partials/*.njk` |
| Colours, fonts, spacing | `public/css/site.css` (tokens at the top) |
| Page titles and descriptions for Google | `lib/pages.js` |

Adding a service to `content/services.js` creates its page, its card on the home page, its entry in
the sitemap and its option in the consultation form.

`content/proof.js` has one rule: nothing invented. Testimonials and portfolio sections stay hidden
until real entries are added.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run dev` always saves form submissions to `data/submissions.json`,
never to the live lead tracker. The local admin password is `tabletop2026` unless `ADMIN_PASSWORD` is set.

```bash
npm test         # form validation and spam protection
npm run check    # every page: titles, headings, links, images, structured data
```

## Settings (environment variables)

Set these in the host's dashboard (Render: Environment). None are stored in the code.

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | **Required on the live site.** Password for `/admin`. Without it the lead tracker stays switched off. |
| `DATABASE_URL` | Postgres connection string. Without it leads are saved to a local file, which hosts wipe on redeploy. |
| `SITE_URL` | Public address, for example `https://www.example.com`. Only needed with a custom domain. |
| `FORM_SECRET` | Optional. Any long random text. Keeps form tokens valid across restarts. |
| `CONTACT_EMAIL`, `CONTACT_PHONE` | Optional. Override the details in `content/site.js`. |
| `BOOKING_URL` | Optional. An online calendar link shown on the consultation page. |
| `GTM_ID` | Optional. Google Tag Manager container, `GTM-XXXXXXX`. |
| `GA4_ID` | Optional. Google Analytics 4, `G-XXXXXXXXXX`. Ignored when `GTM_ID` is set. |
| `GOOGLE_ADS_ID`, `GOOGLE_ADS_LEAD_LABEL` | Optional. Google Ads account `AW-XXXXXXXXX` and the conversion label for a lead. |
| `GOOGLE_SITE_VERIFICATION` | Optional. The code from Google Search Console's "HTML tag" method. |

With no tracking IDs set, the site loads no third-party scripts and sets no tracking cookies.

## Analytics events

The site sends these to Tag Manager or Analytics once an ID is set:

| Event | When | Details sent |
| --- | --- | --- |
| `cta_click` | Any call-to-action button | `cta_label`, `cta_location`, `link_url` |
| `form_start` | First interaction with a form | `form` |
| `form_error` | A form could not be sent | `form`, `reason` |
| `generate_lead` | Thank-you page after a successful form | `lead_type` (`contact` or `consultation`), `service` |
| `book_consultation` | Thank-you page after a consultation request | `service` |
| `contact_click` | Phone, email or social link pressed | `method` |
| `booking_link_click` | Calendar link pressed | |

## Search engines

- Sitemap: `/sitemap.xml`. Submit it in Google Search Console.
- `robots.txt` blocks `/admin` and `/api/`.
- When page content changes, update that page's `updated` date in `lib/pages.js` or `content/services.js`.

## Deploying

Pushing to `main` on GitHub redeploys the site on Render. Every page is built at start-up; if one
fails to build, the deploy stops and the previous version stays online.
