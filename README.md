# Quorvia Marketing — Site

A single-page marketing site with a contact form that saves submissions, viewable in a simple password-protected admin dashboard.

## Run it locally

```bash
npm install
npm start
```

Then open:
- Site: http://localhost:3000
- Admin (view submissions): http://localhost:3000/admin — password: `tabletop2026`

## Configuration

Copy `.env.example` to `.env` and fill in values for local testing (`.env` is gitignored, never commit it):

- `ADMIN_PASSWORD` — password for `/admin`. Set a real one before going live.
- `PORT` — defaults to 3000.
- `DATABASE_URL` — optional. If unset, submissions save to a local file at `data/submissions.json`. If set to a Postgres connection string, submissions save to that database instead (the `submissions` table is created automatically on first run). Use a database in production — hosting platforms typically wipe local files on every redeploy.

## Deploying live

1. Push this repo to GitHub.
2. Create a free Postgres database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and copy its connection string.
3. Create a web service on a Node-friendly host (e.g. [Render](https://render.com)) connected to the GitHub repo, with build command `npm install` and start command `npm start`.
4. In the host's dashboard, set environment variables: `ADMIN_PASSWORD` (a real password) and `DATABASE_URL` (from step 2).
5. Once deployed, visit the live URL and submit a test message, then check `/admin` to confirm it saved.
6. Optional: connect a custom domain through the host's dashboard.
