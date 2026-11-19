# MotiBelajar Implementation Plan

Goal: Build the academic demonstration with production-grade authorization and private-by-default data boundaries.

Architecture: Next.js App Router and TypeScript over Supabase Auth, PostgreSQL RLS, and Storage. One modular monolith. Public Google Sites data uses projection tables; private data never reaches anonymous routes.

Spec: `C:/Users/UseR/AppData/Local/hermes/cache/scratch/MotiBelajar-technical-specification.md` v0.3.2

## Global constraints

- Global roles: `admin`, `student`, `bk_teacher`.
- Contextual BK and reviewer permissions are server-derived.
- No automated diagnosis or risk determination.
- Default upload limit: 10 MB.
- Demo uses dummy accounts and simulated consent.
- No real student data.

## Review focus

- RLS must be tested through authenticated clients, not service role.
- Student responses must never include answer keys or protected scoring fields.
- Primary BK replacement must be transactional and deferred-trigger safe.
- Public projections must not expose source-table columns.
- Private storage objects must never be directly uploaded to public storage.

## Execution order

1. Canonical migration, grants, constraints, helper functions, and RLS.
2. Storage policies and publication boundary.
3. Auth/session client and role/context tests.
4. Counseling, assessment, and bounded LMS domain APIs.
5. Public projection API and Google Sites embed.
6. Dashboard UI after authorization tests.

Status: Phase 1 scaffolded locally; cloud integration and runtime tests pending Supabase project credentials.
