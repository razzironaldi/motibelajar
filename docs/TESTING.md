# Testing

## Commands

```text
npm run db:reset       # local Supabase only
npm run db:lint
npm run db:test
npm run db:audit
npm run lint
npm run build
```

## Current evidence

- `db:reset`: PASS; migrations 0001–0011 applied locally, seed.sql loaded.
- `db:lint`: PASS; No schema errors found.
- `db:test`: PASS; 19 files, 114 tests.
- `db:audit`: PASS; 59 tables, 54 policies, structural guardrails only.
- `npm run lint`: PASS; 0 errors.
- `npm run build`: PASS; TypeScript compilation and 30 routes generated.
- `scripts/test_local_api.py`: 19 authorization checks PASS; Storage subchecks may report synthetic HTTP 599 timeout despite standalone direct HTTP Storage PASS.

## Required next gates

- Authenticated API matrix for goals, counseling, assessment, and LMS.
- Real browser SSR login/logout/session persistence.
- Storage JS SDK regression test after root-cause fix or documented adapter decision.
- Publication copy, anonymous fetch, revocation deletion, and post-revoke fetch.
- Playwright browser E2E and accessibility checks.

A passing build is not authorization evidence. A 200 response with empty rows is not sufficient authorization evidence.
