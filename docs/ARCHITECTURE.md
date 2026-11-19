# MotiBelajar Architecture

## Shape

One Next.js 16 App Router modular monolith. Supabase Auth, PostgreSQL, and Storage remain the central data boundary. Browser uses publishable key and user session. Server routes use SSR session. No cloud connection is used during local development.

## Boundaries

- `src/app`: route/UI composition.
- `src/app/api`: request validation, session lookup, response envelope.
- `src/lib/supabase`: browser and server clients.
- `supabase/migrations`: schema, constraints, RLS, lifecycle functions.
- `scripts`: local runtime diagnostics and audits.
- `src/app/api/public/v1`: allowlisted anonymous projections only.

## Authorization

Role comes from `public.profiles`, never request input. RLS is deny-first. Sensitive columns are isolated through grants/projections. Admin operational access does not imply access to journal bodies, private counseling notes, answer keys, or protected scoring.

## Storage

New files default to `private-assets`. Object paths are owner/context scoped. Public publication requires a private source asset, approval, audit actor, public copy, and explicit revocation deletion. Database status alone is never treated as URL revocation.

## Runtime rules

All mutations validate input server-side, authorize with the authenticated session, use bounded queries, and return safe errors with a request ID. Public endpoints select explicit columns and expose no private identifiers or content.
