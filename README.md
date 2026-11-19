# MotiBelajar

Platform modular monolith untuk motivasi belajar, konseling BK privat, dan LMS akademik terbatas.

## Stack

- Next.js 16 + TypeScript + App Router
- Supabase Auth, PostgreSQL, RLS, Storage
- Tailwind CSS 4
- Vercel target deployment

## Current status

Phase 1 foundation:

- Public landing page responsive.
- Email/password login form.
- SSR Supabase client and Next.js `proxy.ts` auth boundary.
- Protected `/app` route.
- Canonical foundation migration and demo seed.
- Private-first storage design and public projection tables.

Database migration and RLS runtime verification are pending because Supabase CLI, Docker, and `psql` are not installed in this environment. Never treat the SQL as production-ready until it has been applied to a disposable local Supabase database and authorization tests pass.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set these values in `.env.local` using the Supabase project dashboard. Never commit `.env.local`.

```text
NEXT_PUBLIC_SUPABASE_URL=[REDACTED]
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[REDACTED]
NEXT_PUBLIC_APP_ENV=local
```

## Checks

```bash
npm run lint
npm run build
```

## Supabase

```bash
supabase start
supabase db reset
```

Apply only to local/demo environments. Do not run `db reset` or demo seed against production. The migration source of truth is `supabase/migrations/0001_foundation.sql`.

## Security boundaries

- No real student data.
- No diagnosis or automated risk determination.
- Private counseling notes, assessment keys/results, submissions, and unpublished files remain private.
- Anonymous access is limited to explicit public projection tables.
- Student-facing queries must never select protected answer keys or scoring configuration.
- Credentials, tokens, passwords, and connection strings stay outside Git.
