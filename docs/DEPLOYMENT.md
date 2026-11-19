# Deployment Readiness

## Local

Use Docker-backed local Supabase. Run `npm run db:reset` only against the local disposable project. Set `.env.local` from local CLI status; never commit it.

## Preview/production preparation

Required values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_ENV`. A service-role key is not required by the browser and must never enter client code. If an administrative worker later requires it, isolate it in server-only runtime and document the narrow operation.

## Local readiness evidence

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run db:reset`, `npm run db:lint`, `npm run db:test`: PASS; 19 files, 114 tests.
- `npm run db:audit`: PASS; structural only.
- Public embeds `/embed/announcements` and `/embed/courses`: local HTTP 200.
- Public API routes require `.env.local`; without local Supabase URL/key they return 503 by design.

## Not executed

No Vercel deployment, cloud Supabase link, remote migration, external account authorization, billing action, or Google Sites deployment has been performed.

Authenticated browser E2E remains unverified because no browser session was created with the disposable fixture credentials.

## Production TBD

HTTPS/HSTS, CSP/frame policy final origins, rate limiting provider, backups/restore, malware scanning, retention policy, monitoring, and institutional approval require deployment-specific decisions.
