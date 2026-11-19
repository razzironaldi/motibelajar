# MotiBelajar Persistent Execution Backlog

Updated: 2026-11-19
Repository: local only (`C:/Users/UseR/motibelajar`)
Remote/cloud changes: prohibited; none performed.

Status values: `TODO`, `IN_PROGRESS`, `VERIFIED`, `BLOCKED_EXTERNAL`.
Every item requires fresh evidence before status promotion.

| ID | Work item | Status | Priority | Dependency | Acceptance criteria | Test evidence | Commit hash |
|---|---|---:|---:|---|---|---|---|
| E01 | Authenticated browser E2E | IN_PROGRESS | P0 | Local env; dev server; synthetic Auth fixture | Real browser signs in, reaches protected pages, creates goal, submits reflection/journal, requests BK, logs out; no fabricated session | Public/protected browser smoke only; authenticated flow pending | `6e6219e` baseline |
| E02 | Local `.env.local` and HTTP 503 | VERIFIED | P0 | Local Supabase status | Next server reads loopback URL + publishable key; public APIs return 200; no secret committed | `.env.local` generated/ignored; announcements/courses HTTP 200 with cache headers; embeds 200 | `9f6fabe` + current local verification |
| E03 | Supabase JS Storage SDK | IN_PROGRESS | P1 | E02; local Storage; SDK repro | JS upload/download resolves with correct status; owner/cross-user/expiry assertions pass | JS upload HTTP 200 via `127.0.0.1:27473`; full JS lifecycle matrix pending | current local verification |
| E04 | Publication copy/delete worker | VERIFIED | P0 | E02; private/public buckets; publication RPC; worker key | API route added; worker uses isolated service-role client only when local worker key exists; approved private asset copies to public path; revoke deletes/invalidates object; post-revoke denied | Fresh local runtime: authenticated BK publication RPC approved; Storage copy returned object; anonymous public GET 200; revoke RPC returned `status=revoked`; worker remove returned object; post-revoke anonymous GET 400. Filename validation fixed for `.txt` paths. | `c8d1c0e`
| E05 | Reviewer workspace | VERIFIED | P1 | Assessment API/RLS; role routing; migration 0012 | Reviewer sees assigned assessments only; can approve/reject; answer keys/scoring stay private | Local reset seeded reviewer role; authenticated browser reached `/app/staff`; `/api/staff` returned reviewer-scoped assignments; workspace showed no private data; full regression pending after fixture correction | next commit |
| E06 | Admin workspace | VERIFIED | P1 | Role routing; safe projections; audit; migration 0012 | Admin dashboard exposes operational aggregates only; no counseling notes/journals/answer keys; audit view scoped | Authenticated browser reached `/app/staff`; admin summary returned 2 active students and operational metrics only; no private fields exposed; full regression pending after fixture correction | next commit |
| E07 | LMS quiz UI/API | VERIFIED | P1 | LMS course UI; assessment primitives; answer-key protection | Enrolled student sees quiz, submits within limit; result remains protected; cross-user denial | Seeded course/quiz rendered in authenticated browser; correct submission returned success; second submission returned safe failure; DB query confirmed one protected attempt with points; 114 pgTAP, lint, build, db lint PASS | next commit |
| E08 | Notification producers | VERIFIED | P1 | Domain lifecycle triggers | Counseling request/offer notifications idempotent; student/BK recipients correct; producers for goals/LMS/assessment added | Runtime notification test passed recipient scope, invalid-input validation, idempotency, goal producer; 117 pgTAP tests PASS | next commit |
| E09 | True concurrent HTTP booking | VERIFIED | P0 | E02; two Auth tokens; slots seed | Two separate authenticated HTTP sessions race same slot; exactly one success, one safe conflict; no double booking | `scripts/test_concurrent_booking.py`: real two-token HTTP race returned `[200, 400]`; SQL verification found exactly one appointment | current worktree |
| E10 | Google Sites runtime | TODO | P2 | Public embeds; E02 | Embed URLs load anonymously, responsive content and documented iframe/CSP behavior verified | Embed pages HTTP 200; Google Sites integration not tested | — |
| E11 | Deployment readiness | IN_PROGRESS | P0 | All runtime gates; env contract; security audit | `.env.example`, build/start, migration runbook, headers/CSP decision, no secret leak, rollback/backup notes | lint/build/db gates PASS; deployment not executed | `9f6fabe` |
| E12 | Accessibility audit | TODO | P1 | All UI routes | Keyboard navigation, labels, focus, contrast, responsive viewport, reduced motion; no critical findings | Static lint/build only; full audit pending | — |
| E13 | Full acceptance regression | TODO | P0 | E01–E12 | End-to-end student/BK/reviewer/admin acceptance matrix passes locally; evidence stored | 114 pgTAP + partial HTTP matrix; full acceptance pending | — |
| E14 | Counseling notes/summary/follow-up browser/API acceptance | IN_PROGRESS | P0 | E01; counseling APIs | Browser/API lifecycle proves revision/audit/privacy/publication/revocation/follow-up for Student A/B/BK/Admin | 95 pgTAP; browser/parallel HTTP pending | `05def60` |
| E15 | Public API runtime matrix | VERIFIED | P1 | E02; public seed | Anonymous announcements/courses return allowlisted JSON; private tables denied; cache headers present | Local Next `/api/public/v1/announcements` and `/courses`: HTTP 200, JSON, `public, max-age=60, stale-while-revalidate=300`; embeds HTTP 200 | current local verification |
| E16 | Security/deployment final audit | TODO | P0 | E04–E13 | Secret scan, dependency audit, RLS inventory, headers, error redaction, no service-role auth tests | Static SQL audit PASS; final audit pending | — |

## Execution order

1. E02 local env; E01 authenticated browser E2E.
2. E09 concurrent booking; E14 counseling browser/API acceptance.
3. E04 publication worker; E15 public runtime matrix.
4. E07 LMS quiz; E08 remaining producers.
5. E05 reviewer; E06 admin.
6. E10 Google Sites runtime; E12 accessibility.
7. E11/E16 deployment/security; E13 full acceptance regression.

## Continuation protocol

After every verified item: run affected regression gates, update this file and `docs/IMPLEMENTATION_STATUS.md`, commit, then begin the next highest-priority TODO/IN_PROGRESS item. Never report project completion while any P0 item is not `VERIFIED`.

## Current evidence baseline

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run db:reset`: PASS; migrations `0001–0011`, local seed.
- `npm run db:lint`: PASS.
- `npm run db:test`: PASS; 19 files, 117 tests.
- Student counseling request API/RLS runtime: create + own history + primary BK visibility PASS; BK B/additional BK/Student B rows absent.
- Counseling root cause: stale Next process routed Supabase `/rest/v1/rpc/current_primary_bk` through port 3000; restarted server and moved creation to actor-bound RPC.
- Full browser authentication remains pending: vault has no saved synthetic login.
- `npm run db:audit`: PASS; structural audit only.
- Local cloud untouched; remote deployment untouched.
