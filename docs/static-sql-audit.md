# Static SQL audit

Date: 2026-11-18
Scope: `supabase/migrations/0001_foundation.sql`

Status: audit only. No PostgreSQL execution occurred.

## Dependency/order findings

- `pgcrypto` and enum types precede application tables: valid by inspection.
- `file_publications` precedes `is_published_public_asset`: valid by inspection.
- `storage.objects` is an external Supabase-managed relation: requires a real Supabase runtime.
- Dynamic RLS enablement loops over every table in `public`. It is broad and must be checked against the actual local schema.

## Canonical tables found

`schools`, `profiles`, `classes`, `class_memberships`, `counselor_assignments`, `counselor_permissions`, `counseling_notes`, `file_assets`, `file_publications`, `announcements`, `public_site_announcements`, `public_site_courses`, `public_site_lessons`, `public_site_aggregates`, `assessments`, `assessment_versions`, `assessment_scoring_configs`, `assessment_questions`, `assessment_options`, `assessment_answer_keys`, `assessment_assignments`, `assessment_attempts`, `assessment_answers`, `assessment_result_snapshots`, `assessment_review_assignments`, `assessment_approvals`, `question_banks`, `quizzes`, `quiz_questions`, `quiz_question_versions`, `quiz_options`, `quiz_answer_keys`.

## FK/constraint gaps

1. `public_site_lessons.course_id` has no FK to `public_site_courses(id)`.
2. `counseling_notes.session_id` is an untyped UUID with no canonical `counseling_sessions` table.
3. `assessment_attempts.student_id` is not constrained to the student in `assessment_assignments`.
4. `assessment_attempts.version_id` is not constrained to the assignment version.
5. `assessment_answers.question_id` is not constrained to the attempt version.
6. `assessment_answers.option_id` is not constrained to the selected question.
7. `counselor_assignments` does not enforce counselor/student profile roles or same school.
8. `file_assets.bucket`, `visibility`, and `file_publications.status` are unconstrained as a lifecycle relationship. A CHECK plus trigger/function is needed to enforce private-first publication.
9. The deferred primary-BK trigger checks exactly one only for operational students, but does not lock parent rows or validate every transition/concurrency case.

## RLS/grant findings

- Public projection tables receive allowlisted `anon SELECT` grants and visible/cohort policies.
- Sensitive source tables are not granted to `anon`.
- All public tables are RLS-enabled through a dynamic block. This requires runtime verification.
- Most application tables have no explicit policy. This is deny-by-default, but it is not a completed authorization implementation.
- `profiles` exposes a safe own-row SELECT policy, but no safe public/profile projection exists.
- `file_assets` has only owner private SELECT; no INSERT/UPDATE/DELETE contract exists.
- `counseling_notes` is explicit deny-all; primary/additional BK authorization is not implemented.
- Assessment, quiz, assignment, class, announcement, and counselor assignment policies are not implemented.
- Storage has private read/insert and public read policies. No private update/delete policy or controlled publication write path exists.
- `public_object_read` checks a publication path, but does not independently verify the Storage object maps to a `file_assets` row with approved visibility/bucket.

## Helper/trigger findings

- SECURITY DEFINER helpers set a fixed search path, qualify public objects, revoke PUBLIC execute, and grant narrow roles by inspection.
- `current_app_role()` is currently unused by policies.
- The trigger function returns `coalesce(new, old)`. PostgreSQL trigger execution must verify this for INSERT/UPDATE/DELETE constraint-trigger events.
- The trigger does not protect against concurrent replacement/deactivation using parent-row locking.

## Runtime blockers

Observed commands:

- `npx supabase --version` → `3.2.0`
- `npx supabase db lint --local` → `ECONNREFUSED 127.0.0.1:54322`
- Docker executable was unavailable in the prior environment check.

Therefore SQL, RLS, Storage, and Auth remain unverified.

## Required fixes before authorization sign-off

- Add missing canonical relations/FKs or explicitly mark them out of scope.
- Add domain policies for each sensitive table and operation.
- Add server-controlled write paths for profile roles, assignments, files, publication, assessment scoring, and answer keys.
- Add fixture-backed pgTAP positive/negative tests.
- Start local Supabase, run `npx supabase db reset`, `npx supabase db lint`, then run pgTAP and authenticated API tests.
