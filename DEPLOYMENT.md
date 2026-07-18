# Deployment Guide — Supabase · GitHub · Vercel

This project is wired for Supabase (data), GitHub (source), and Vercel (hosting).
Follow these one-time steps to go live.

## 1. Supabase — create the tables

1. Open your project: <https://supabase.com/dashboard/project/yvcjvpychoozvvlxmzbu>
2. Go to **SQL Editor → New query**.
3. Paste the contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) and click **Run**.
4. In the app, go to **Settings → Cloud Sync → Push to Cloud** to upload your data.
   Use **Load from Cloud** on any device to restore it.

> Security: rotate your **secret key** (Dashboard → Settings → API) since it was
> shared in plaintext. Update `SUPABASE_SECRET_KEY` in `.env.local` and in Vercel.

Environment variables (already in `.env.local`, gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...        # server-only
AUTH_SECRET=...
```

## 2. GitHub — push the source

The repo is already committed locally. Create a remote and push:

```bash
# Option A: GitHub CLI (if installed)
gh repo create june8-coffee --private --source=. --remote=origin --push

# Option B: manual — create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/june8-coffee.git
git branch -M main
git push -u origin main
```

`.env.local` is gitignored, so your secrets are **not** pushed.

## 3. Vercel — deploy

1. Go to <https://vercel.com/new> and **Import** your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Root directory: `june9-coffee`
   (this folder) if the repo root is one level up; otherwise leave as `.`.
3. Add **Environment Variables** (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `AUTH_SECRET`
4. Click **Deploy**. Vercel builds and hosts the app; every `git push` redeploys.

### Or via the Vercel CLI

```bash
npm i -g vercel
vercel            # link + configure
vercel --prod     # production deploy
```

## Notes

- The app persists locally (localStorage) by default and syncs to Supabase on
  demand via **Settings → Cloud Sync**. This keeps it fully functional offline
  and in the demo, while giving you durable cloud storage.
- Data is stored as JSONB documents per entity, matching the app model exactly.
