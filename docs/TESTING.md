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

- `db:reset`: PASS; migrations 0001, 0002, 0003 applied locally.
- `db:lint`: PASS; No schema errors found.
- `db:test`: PASS; 3 files, 37 tests.
- `db:audit`: PASS; 37 tables, 19 policies, structural guardrails only.
- `npm run lint`: PASS; 0 errors.
- `npm run build`: PASS; TypeScript compilation and 14 routes generated.

## Required next gates

- Authenticated API matrix for goals, counseling, assessment, and LMS.
- Real browser SSR login/logout/session persistence.
- Storage JS SDK regression test after root-cause fix or documented adapter decision.
- Publication copy, anonymous fetch, revocation deletion, and post-revoke fetch.
- Playwright browser E2E and accessibility checks.

A passing build is not authorization evidence. A 200 response with empty rows is not sufficient authorization evidence.
