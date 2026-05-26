# Tutor Dashboard

A multi-tenant SaaS CRM dashboard for private tutors. Each tutor signs in and
sees only their own students, session logs, and Preply review follow-ups —
enforced end-to-end with Supabase Row Level Security (`tutor_id = auth.uid()`).

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) for auth and Postgres

## Features

- Email/password auth (sign in + sign up with email confirmation).
- **Dashboard** with three widgets:
  1. **Preply Review Tracker** — review-status counts plus one-click follow-up
     advancement (Not Asked → Asked → Reviewed) and Preply links.
  2. **Lessons Per Week** — sessions logged this week (Monday start) vs. each
     student's plan, with progress bars.
  3. **Master Roster** — every student with grade, curriculum, lessons/week,
     per-hour rate, review badge, and Preply link.
- Student CRUD with a reusable form (create + edit).
- Per-student session logging, history, and deletion.
- **Parent Report Generator** — copy a plain-text report to the clipboard or
  print a clean, print-scoped PDF.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a [Supabase](https://supabase.com) project and run the SQL in
   [`supabase/schema.sql`](supabase/schema.sql) (SQL Editor). It creates the
   tables, enums, triggers, and RLS policies.

3. Copy the env example and fill in your project credentials
   (Supabase → Settings → API):

   ```bash
   cp .env.local.example .env.local
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/proxy.ts` — Next.js 16 Proxy (formerly middleware); refreshes the
  Supabase session and gates authenticated routes.
- `src/lib/supabase/` — browser, server, and proxy Supabase clients.
- `src/app/(app)/` — authenticated route group (dashboard + students).
- `src/app/login/` — auth UI and server actions.
- `supabase/schema.sql` — database schema, triggers, and RLS policies.
