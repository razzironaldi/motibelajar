# Deployment Readiness

## Local

Use Docker-backed local Supabase. Run `npm run db:reset` only against the local disposable project. Set `.env.local` from local CLI status; never commit it.

## Preview/production preparation

Required values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_ENV`. A service-role key is not required by the browser and must never enter client code. If an administrative worker later requires it, isolate it in server-only runtime and document the narrow operation.

## Not executed

No Vercel deployment, cloud Supabase link, remote migration, external account authorization, billing action, or Google Sites deployment has been performed.

## Production TBD

HTTPS/HSTS, CSP/frame policy final origins, rate limiting provider, backups/restore, malware scanning, retention policy, monitoring, and institutional approval require deployment-specific decisions.
