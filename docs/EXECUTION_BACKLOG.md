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
| E03 | Supabase JS Storage SDK | BLOCKED_EXTERNAL | P1 | E02; local Storage; SDK repro | JS upload/download resolves with correct status; owner/cross-user/expiry assertions pass | Direct HTTP PASS; JS harness synthetic `599`, object persists | `9f6fabe` |
| E04 | Publication copy/delete worker | TODO | P0 | E02; private/public buckets; publication RPC | Approved private asset copies to public path; anonymous fetch 200; revoke deletes/invalidates object; post-revoke denied | No copy/delete worker evidence | — |
| E05 | Reviewer workspace | TODO | P1 | Assessment API/RLS; role routing | Reviewer sees assigned assessments only; can approve/reject; answer keys/scoring stay private | DB contract exists; UI/runtime reviewer workflow pending | — |
| E06 | Admin workspace | TODO | P1 | Role routing; safe projections; audit | Admin dashboard exposes operational aggregates only; no counseling notes/journals/answer keys; audit view scoped | Role RLS tests exist; workspace UI pending | — |
| E07 | LMS quiz UI/API | TODO | P1 | LMS course UI; assessment primitives | Enrolled student sees quiz, submits once/within limit, result is descriptive; cross-user denial | LMS progress DB/API + UI PASS; quiz pending | `5daa8d4` |
| E08 | Notification producers | IN_PROGRESS | P1 | Domain lifecycle triggers | Counseling request/offer notifications idempotent; student/BK recipients correct; producers for goals/LMS/assessment added | 114 pgTAP PASS includes counseling producers | `bdd18f9` |
| E09 | True concurrent HTTP booking | TODO | P0 | E02; two Auth tokens; slots seed | Two separate authenticated HTTP sessions race same slot; exactly one success, one safe conflict; no double booking | Deterministic DB collision only; HTTP race pending | — |
| E10 | Google Sites runtime | TODO | P2 | Public embeds; E02 | Embed URLs load anonymously, responsive content and documented iframe/CSP behavior verified | Embed pages HTTP 200; Google Sites integration not tested | — |
| E11 | Deployment readiness | IN_PROGRESS | P0 | All runtime gates; env contract; security audit | `.env.example`, build/start, migration runbook, headers/CSP decision, no secret leak, rollback/backup notes | lint/build/db gates PASS; deployment not executed | `9f6fabe` |
| E12 | Accessibility audit | TODO | P1 | All UI routes | Keyboard navigation, labels, focus, contrast, responsive viewport, reduced motion; no critical findings | Static lint/build only; full audit pending | — |
| E13 | Full acceptance regression | TODO | P0 | E01–E12 | End-to-end student/BK/reviewer/admin acceptance matrix passes locally; evidence stored | 114 pgTAP + partial HTTP matrix; full acceptance pending | — |
| E14 | Counseling notes/summary/follow-up browser/API acceptance | IN_PROGRESS | P0 | E01; counseling APIs | Browser/API lifecycle proves revision/audit/privacy/publication/revocation/follow-up for Student A/B/BK/Admin | 95 pgTAP; browser/parallel HTTP pending | `05def60` |
| E15 | Public API runtime matrix | IN_PROGRESS | P1 | E02; public seed | Anonymous announcements/courses return allowlisted JSON; private tables denied; cache headers present | Current Next route 503; local PostgREST projection tested earlier | `9f6fabe` |
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
- `npm run db:test`: PASS; 19 files, 114 tests.
- `npm run db:audit`: PASS; structural audit only.
- Local cloud untouched; remote deployment untouched.
