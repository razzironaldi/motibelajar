# Local database verification runbook

Cloud Supabase is intentionally not used by any command in this runbook.

Prerequisite: Docker Desktop running, `docker` available on PATH.

From `C:\Users\UseR\motibelajar`:

```bash
npx supabase start
npx supabase status
npx supabase db reset
npx supabase db lint --local
npx supabase test db
```

Expected order:

1. `supabase start` creates the disposable local stack.
2. `supabase status` confirms API, DB, Auth, Storage, and Studio endpoints.
3. `supabase db reset` applies every migration and local seed to a clean database.
4. `supabase db lint --local` checks the running local database.
5. `supabase test db` runs SQL tests under `supabase/tests/`.

Fixtures:

- `supabase/tests/fixtures/roles.fixture` contains dummy local identities only and is loaded explicitly by the authorization test.
- `supabase/tests/fixtures/policy_inventory.sql` is a manual runtime catalog report; it is not a pgTAP test.
- Fixture password: `fixture-password` (test-only; never reuse).

Test actors:

- Student A/B
- BK A/B
- Additional BK
- Admin
- Reviewer
- Anonymous is represented by the default `anon` role in policy tests.

Current evidence:

- `npx supabase --version` returned `3.2.0`.
- `npx supabase db lint --local` failed before SQL execution with `ECONNREFUSED 127.0.0.1:54322`.
- `docker version` failed with `docker: command not found`.

Do not run `supabase link`, `supabase db push`, or any cloud-targeted command for this repository.
