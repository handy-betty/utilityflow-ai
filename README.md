# UtilityFlow AI

A mock utility work-management system built as a DVR retraining portfolio project.

## What it demonstrates
- Work order management
- Dispatch workflow
- Manual QA testing
- Bug reporting
- Training and go-live documentation
- Controlled AI help assistant
- Supabase-ready database design
- Vercel-ready Next.js deployment

## Tech stack
- Next.js
- TypeScript
- Tailwind CSS
- Supabase-ready backend
- Vercel hosting

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy `.env.example` to `.env.local`.
5. Add your Supabase URL and anon key.
6. Restart the dev server.

The current MVP uses local demo data so it works before Supabase is configured.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add Supabase environment variables in Vercel when ready.
4. Deploy.

## DVR portfolio note

This project is designed to support a retraining discussion toward project management, software implementation, QA testing, business systems analysis, and responsible AI support.
