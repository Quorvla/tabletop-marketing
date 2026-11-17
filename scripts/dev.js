// Safe local mode: `npm run dev`.
// Leads go to a local file (data/submissions.json), never to the live lead tracker,
// even if DATABASE_URL is present in .env.

process.env.NODE_ENV = 'development';
process.env.LEADS_STORE = 'file';

require('../server');
