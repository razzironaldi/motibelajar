# Security and Privacy

## Enforced locally

- Protected `/app` SSR boundary plus proxy.
- Role stored in trusted profile row.
- Profile read uses safe columns; role/email are not client-readable by default.
- RLS enabled on application tables through migration.
- Broad anon/authenticated table privileges revoked before allowlist grants.
- Public data uses dedicated projection tables and explicit columns.
- Private Storage bucket is owner-path scoped.
- Sensitive assessment tables and counseling notes default deny.
- SQL helper functions use `SECURITY DEFINER` with fixed `search_path` and revoked public execute.
- No credentials/tokens are written to reports.

## Sensitive logging prohibition

Never log passwords, JWTs, API keys, counseling notes, journal bodies, answer keys, protected scoring, or private object URLs.

## Known gaps

Publication worker, request IDs in every domain mutation, rate limiting, CSRF review, CSP finalization, demo reset, audit event producers, and browser/E2E security tests remain in progress. No production compliance claim is made.
