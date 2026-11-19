-- MotiBelajar foundation. Apply only to local/demo Supabase.
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin','student','bk_teacher');
create type public.assignment_type as enum ('primary','additional');

create table public.schools (id uuid primary key default gen_random_uuid(), name text not null, timezone text not null default 'Asia/Jakarta', active boolean not null default true, created_at timestamptz not null default now());
create table public.profiles (id uuid primary key references auth.users(id) on delete restrict, school_id uuid references public.schools(id) on delete restrict, role public.app_role not null, email text not null, display_name text not null, student_code text, active boolean not null default true, operational_student boolean not null default false, demo_account boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.classes (id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete restrict, name text not null, grade text, academic_year text, active boolean not null default true);
create table public.class_memberships (id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade, profile_id uuid not null references public.profiles(id) on delete restrict, started_at timestamptz not null default now(), ended_at timestamptz);
create table public.counselor_assignments (id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete restrict, counselor_id uuid not null references public.profiles(id) on delete restrict, student_id uuid not null references public.profiles(id) on delete restrict, assignment_type public.assignment_type not null, active boolean not null default false, active_from timestamptz not null default now(), active_to timestamptz);
create table public.counselor_permissions (id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.counselor_assignments(id) on delete cascade, permission_code text not null, granted_by uuid not null references public.profiles(id) on delete restrict, granted_at timestamptz not null default now(), revoked_at timestamptz);
create table public.counseling_notes (id uuid primary key default gen_random_uuid(), session_id uuid not null, counselor_id uuid not null references public.profiles(id) on delete restrict, body_protected text not null, visibility text not null default 'private' check (visibility='private'), revision_no int not null default 1, created_at timestamptz not null default now());
create unique index one_active_primary_bk_per_student on public.counselor_assignments(student_id) where assignment_type='primary' and active=true;
create unique index one_active_permission on public.counselor_permissions(assignment_id, permission_code) where revoked_at is null;

create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path = pg_catalog, public
as $$ select p.role from public.profiles p where p.id=(select auth.uid()) $$;
revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;



create table public.file_assets (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict, bucket text not null check (bucket in ('private-assets','public-assets')), object_path text not null unique, mime_type text not null, byte_size bigint not null check (byte_size > 0 and byte_size <= 10485760), checksum text, visibility text not null default 'private' check (visibility in ('private','public')), created_at timestamptz not null default now());
create table public.file_publications (id uuid primary key default gen_random_uuid(), file_asset_id uuid not null unique references public.file_assets(id) on delete restrict, published_by uuid not null references public.profiles(id) on delete restrict, approved_at timestamptz not null default now(), revoked_at timestamptz, public_object_path text unique, status text not null check (status in ('approved','revoked')));
create table public.announcements (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, body text not null, status text not null default 'draft', visibility text not null default 'private', published_at timestamptz, updated_at timestamptz not null default now());

create or replace function public.is_published_public_asset(p_object_path text)
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$ select exists (select 1 from public.file_publications fp where fp.public_object_path=p_object_path and fp.status='approved' and fp.revoked_at is null) $$;
revoke all on function public.is_published_public_asset(text) from public;
grant execute on function public.is_published_public_asset(text) to anon, authenticated;

create table public.public_site_announcements (id uuid primary key, slug text not null unique, title text not null, body text not null, published_at timestamptz not null, schema_version int not null default 1, source_version int not null default 1, visible boolean not null default true);
create table public.public_site_courses (id uuid primary key, slug text not null unique, title text not null, summary text not null, thumbnail_public_asset_id uuid references public.file_assets(id) on delete restrict, published_at timestamptz not null, schema_version int not null default 1, visible boolean not null default true);
create table public.public_site_lessons (id uuid primary key, course_id uuid not null, slug text not null, title text not null, summary text not null, external_video_url text, order_no int not null, published_at timestamptz not null, schema_version int not null default 1, visible boolean not null default true);
create table public.public_site_aggregates (id uuid primary key default gen_random_uuid(), metric_key text not null, cohort_key text not null, cohort_size int not null check (cohort_size >= 5), value_json jsonb not null, generated_at timestamptz not null default now(), schema_version int not null default 1, visible boolean not null default true);

create table public.assessments (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict, name text not null, purpose text not null, status text not null default 'draft');
create table public.assessment_versions (id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.assessments(id) on delete restrict, version_no int not null, status text not null default 'draft', published_at timestamptz, interpretation_schema_json jsonb, unique(assessment_id,version_no));
create table public.assessment_scoring_configs (id uuid primary key default gen_random_uuid(), assessment_version_id uuid not null unique references public.assessment_versions(id) on delete restrict, config_protected jsonb not null, created_by uuid not null references public.profiles(id) on delete restrict);
create table public.assessment_questions (id uuid primary key default gen_random_uuid(), version_id uuid not null references public.assessment_versions(id) on delete restrict, key text not null, prompt text not null, type text not null, dimension text, order_no int not null, required boolean not null default true);
create table public.assessment_options (id uuid primary key default gen_random_uuid(), question_id uuid not null references public.assessment_questions(id) on delete restrict, label text not null, value text not null, order_no int not null);
create table public.assessment_answer_keys (id uuid primary key default gen_random_uuid(), assessment_question_id uuid not null unique references public.assessment_questions(id) on delete restrict, correct_option_ids_protected uuid[] not null, scoring_value_protected jsonb not null);
create table public.assessment_assignments (id uuid primary key default gen_random_uuid(), version_id uuid not null references public.assessment_versions(id) on delete restrict, student_id uuid not null references public.profiles(id) on delete restrict, opens_at timestamptz, closes_at timestamptz, attempt_limit int not null default 1);
create table public.assessment_attempts (id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.assessment_assignments(id) on delete restrict, student_id uuid not null references public.profiles(id) on delete restrict, version_id uuid not null references public.assessment_versions(id) on delete restrict, status text not null default 'draft', submitted_at timestamptz);
create table public.assessment_answers (id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.assessment_attempts(id) on delete cascade, question_id uuid not null references public.assessment_questions(id) on delete restrict, option_id uuid references public.assessment_options(id) on delete restrict, value_json jsonb);
create table public.assessment_result_snapshots (id uuid primary key default gen_random_uuid(), attempt_id uuid not null unique references public.assessment_attempts(id) on delete restrict, score_protected jsonb not null, interpretation_protected jsonb, created_at timestamptz not null default now());
create table public.assessment_review_assignments (id uuid primary key default gen_random_uuid(), assessment_version_id uuid not null references public.assessment_versions(id) on delete restrict, reviewer_id uuid not null references public.profiles(id) on delete restrict, permission text not null default 'review', assigned_by uuid not null references public.profiles(id) on delete restrict, assigned_at timestamptz not null default now(), decided_at timestamptz);
create table public.assessment_approvals (id uuid primary key default gen_random_uuid(), assessment_version_id uuid not null references public.assessment_versions(id) on delete restrict, reviewer_id uuid not null references public.profiles(id) on delete restrict, decision text not null, comment text, decided_at timestamptz not null default now());

create table public.question_banks (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict, name text not null);
create table public.quizzes (id uuid primary key default gen_random_uuid(), title text not null, status text not null default 'draft');
create table public.quiz_questions (id uuid primary key default gen_random_uuid(), quiz_id uuid not null references public.quizzes(id) on delete restrict, question_bank_id uuid references public.question_banks(id) on delete restrict, prompt text not null, type text not null, points numeric not null default 1, order_no int not null, status text not null default 'draft');
create table public.quiz_question_versions (id uuid primary key default gen_random_uuid(), quiz_question_id uuid not null references public.quiz_questions(id) on delete restrict, version_no int not null, prompt_snapshot text not null, published_at timestamptz, unique(quiz_question_id,version_no));
create table public.quiz_options (id uuid primary key default gen_random_uuid(), quiz_question_version_id uuid not null references public.quiz_question_versions(id) on delete restrict, label text not null, value text not null);
create table public.quiz_answer_keys (id uuid primary key default gen_random_uuid(), quiz_question_version_id uuid not null unique references public.quiz_question_versions(id) on delete restrict, correct_option_ids_protected uuid[] not null, scoring_config_protected jsonb not null);

-- Public projections: anon only sees published allowlisted rows.
alter table public.public_site_announcements enable row level security;
alter table public.public_site_courses enable row level security;
alter table public.public_site_lessons enable row level security;
alter table public.public_site_aggregates enable row level security;
revoke all on public.profiles, public.file_assets, public.announcements from anon;
grant select (id,slug,title,body,published_at,schema_version,source_version,visible) on public.public_site_announcements to anon;
grant select (id,slug,title,summary,thumbnail_public_asset_id,published_at,schema_version,visible) on public.public_site_courses to anon;
grant select (id,course_id,slug,title,summary,external_video_url,order_no,published_at,schema_version,visible) on public.public_site_lessons to anon;
grant select (id,metric_key,cohort_key,cohort_size,value_json,generated_at,schema_version,visible) on public.public_site_aggregates to anon;
create policy public_announcements_read on public.public_site_announcements for select to anon,authenticated using (visible=true);
create policy public_courses_read on public.public_site_courses for select to anon,authenticated using (visible=true);
create policy public_lessons_read on public.public_site_lessons for select to anon,authenticated using (visible=true);
create policy public_aggregates_read on public.public_site_aggregates for select to anon,authenticated using (visible=true and cohort_size >= 5);

-- Private tables default deny. Remove broad Supabase default table grants before policies.
do $$
declare t record;
begin
  for t in select tablename from pg_catalog.pg_tables where schemaname='public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('revoke all on table public.%I from anon, authenticated', t.tablename);
  end loop;
end $$;
grant select on public.public_site_announcements, public.public_site_courses, public.public_site_lessons, public.public_site_aggregates to anon, authenticated;
grant select (id, display_name, student_code, active) on public.profiles to authenticated;

create or replace function public.is_primary_bk(p_student_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$ select exists (select 1 from public.counselor_assignments ca where ca.student_id=p_student_id and ca.counselor_id=(select auth.uid()) and ca.assignment_type='primary' and ca.active=true) $$;
revoke all on function public.is_primary_bk(uuid) from public;
grant execute on function public.is_primary_bk(uuid) to authenticated;

create policy profiles_own_read on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy profiles_primary_bk_read on public.profiles for select to authenticated using (role='student' and public.is_primary_bk(id));
-- Profile role and lifecycle fields are server/admin-managed. No client UPDATE policy is granted in foundation.
create policy file_assets_owner_read on public.file_assets for select to authenticated using (owner_id=(select auth.uid()) and bucket='private-assets');
create policy counseling_notes_deny_all on public.counseling_notes as restrictive for all to authenticated using (false) with check (false);

create or replace function public.enforce_operational_primary()
returns trigger language plpgsql security definer set search_path = pg_catalog, public
as $$ declare sid uuid; n int; begin sid := coalesce(new.student_id, old.student_id); if exists(select 1 from public.profiles p where p.id=sid and p.role='student' and p.active and p.operational_student) then select count(*) into n from public.counselor_assignments where student_id=sid and assignment_type='primary' and active; if n <> 1 then raise exception 'operational student must have exactly one active primary BK'; end if; end if; return coalesce(new,old); end $$;
revoke all on function public.enforce_operational_primary() from public;
create constraint trigger counselor_primary_lifecycle after insert or update or delete on public.counselor_assignments deferrable initially deferred for each row execute function public.enforce_operational_primary();

-- Storage policies: storage.objects RLS is managed by Supabase Storage; application adds policies only.
create policy private_object_read on storage.objects for select to authenticated using (bucket_id='private-assets' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy private_object_insert on storage.objects for insert to authenticated with check (bucket_id='private-assets' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy public_object_read on storage.objects for select to anon,authenticated using (bucket_id='public-assets' and public.is_published_public_asset(name));

comment on schema public is 'MotiBelajar canonical foundation; application RLS is deny-by-default.';
