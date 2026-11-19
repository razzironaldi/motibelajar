# MotiBelajar Implementation Status

Updated: 2026-11-19
Environment: local Docker Supabase only. Cloud untouched.

## Verified

| Area | Status | Evidence |
|---|---|---|
| Next.js App Router baseline | VERIFIED | `npm run build` exit 0 |
| ESLint | VERIFIED | `npm run lint` exit 0, 0 errors |
| SQL schema lint | VERIFIED | `npm run db:lint`, No schema errors found |
| pgTAP foundation + authorization + domain contract | VERIFIED | 3 files, 37 tests, PASS |
| Static SQL audit | VERIFIED | `tables=37`, `policies=19`, structural audit PASS |
| Local Storage HTTP lifecycle | VERIFIED | Existing evidence: upload/download/signed URL/expiry |
| Storage JS client completion | BLOCKED | Server creates object, client promise timeout remains |
| Public projection API | IN_PROGRESS | Routes added; runtime API request pending |
| Student goals | VERIFIED | Migration, RLS, GET/POST route, SSR UI; browser flow pending |
| Motivation reflection | IN_PROGRESS | Versioned instrument, 1–4 answers, transactional submit, immutable result, Student A/B tests, API/UI added; browser flow pending |
| Journal/reflection | IN_PROGRESS | Private student-owned entries, revision history, API/UI, Student A/B/Admin isolation tests; browser flow pending |
| SSR/browser E2E | IN_PROGRESS | Local browser harness rendered landing page; protected `/app` returned 307 to `/login`; follow-up navigation timed out, authenticated flow pending |
| Publication/revocation worker | IN_PROGRESS | DB guarded functions added; Storage copy/delete worker + tests pending |
| Counseling request | VERIFIED | Migration 0004, RLS/helper, authenticated API, student UI; included in 64 pgTAP PASS |
| Counseling queue/booking | IN_PROGRESS | BK queue, slots, offer/confirm/cancel/reschedule APIs, row locks/advisory overlap guard; browser and parallel HTTP evidence pending |
| Counseling notes/summary/follow-up | IN_PROGRESS | Revision/audit/publication/follow-up RPCs, APIs, 95 pgTAP runtime/contract tests; browser and parallel HTTP evidence pending |
| Assessment | IN_PROGRESS | Assignment-scoped student question projection, transactional submit, protected scoring/result snapshot, contract tests 100 PASS, student UI/API added; reviewer workflow pending |
| LMS | IN_PROGRESS | Published enrolled course/lesson read, progress RPC/API, Student A/B/Admin isolation tests; enrolled course UI + progress mutation added; quiz workflow pending |
| Notifications | IN_PROGRESS | Table/RLS added; event producers pending |
| Admin/BK workspaces | IN_PROGRESS | BK queue now role-sensitive in shared workspace; admin/reviewer workspace and browser-authenticated role evidence pending |

## Current checkpoint

- Migration: `supabase/migrations/0003_core_domain.sql`
- Domain contract: `supabase/tests/002_domain_contract_test.sql`
- Goal API: `src/app/api/goals/route.ts`
- Goal UI: `src/app/app/belajar/page.tsx`, `goal-form.tsx`
- Public API: `src/app/api/public/v1/`
- Public embeds: `src/app/embed/`

## Explicit non-claims

Build/lint do not prove authorization. Static audit does not prove runtime RLS. Existing Storage HTTP evidence does not prove the JS SDK timeout is fixed. Publication is not complete until a public object is copied, fetched anonymously, revoked through Storage API, then fetched again and rejected.

## Next execution order

1. Run local browser SSR/auth and goal flow.
2. Implement counseling request/session/summary lifecycle with RLS and API tests.
3. Implement assessment version/reviewer/attempt lifecycle.
4. Implement bounded LMS catalog/progress/quiz/submission/grading.
5. Implement publication worker and public API runtime tests.
6. Add admin/BK routing, notifications, demo seed/reset, accessibility/E2E gates.
