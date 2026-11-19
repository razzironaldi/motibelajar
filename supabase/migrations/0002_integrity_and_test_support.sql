-- Integrity additions. Requires 0001_foundation.sql.
create table public.counseling_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  counselor_id uuid not null references public.profiles(id) on delete restrict,
  scheduled_at timestamptz,
  status text not null default 'requested' check (status in ('requested','scheduled','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.counseling_notes
  add constraint counseling_notes_session_fk
  foreign key (session_id) references public.counseling_sessions(id) on delete restrict;

alter table public.public_site_lessons
  add constraint public_site_lessons_course_fk
  foreign key (course_id) references public.public_site_courses(id) on delete cascade;

alter table public.assessment_assignments
  add constraint assessment_assignments_attempt_limit_ck check (attempt_limit > 0);

create or replace function public.validate_assessment_attempt_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (
    select 1 from public.assessment_assignments a
    where a.id = new.assignment_id
      and a.student_id = new.student_id
      and a.version_id = new.version_id
  ) then
    raise exception 'assessment attempt does not match assignment student and version';
  end if;
  return new;
end;
$$;
revoke all on function public.validate_assessment_attempt_integrity() from public;
grant execute on function public.validate_assessment_attempt_integrity() to service_role;
create trigger assessment_attempt_integrity
before insert or update on public.assessment_attempts
for each row execute function public.validate_assessment_attempt_integrity();

create or replace function public.validate_assessment_answer_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (
    select 1
    from public.assessment_attempts a
    join public.assessment_questions q on q.version_id = a.version_id
    where a.id = new.attempt_id and q.id = new.question_id
  ) then
    raise exception 'assessment answer question does not belong to attempt version';
  end if;
  if new.option_id is not null and not exists (
    select 1 from public.assessment_options o
    where o.id = new.option_id and o.question_id = new.question_id
  ) then
    raise exception 'assessment answer option does not belong to question';
  end if;
  return new;
end;
$$;
revoke all on function public.validate_assessment_answer_integrity() from public;
grant execute on function public.validate_assessment_answer_integrity() to service_role;
create trigger assessment_answer_integrity
before insert or update on public.assessment_answers
for each row execute function public.validate_assessment_answer_integrity();

create or replace function public.validate_file_publication_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'approved' and (new.public_object_path is null or not exists (
    select 1 from public.file_assets f
    where f.id = new.file_asset_id
      and f.bucket = 'private-assets'
      and f.visibility = 'private'
  )) then
    raise exception 'only private asset may be published through approved publication';
  end if;
  return new;
end;
$$;
revoke all on function public.validate_file_publication_integrity() from public;
grant execute on function public.validate_file_publication_integrity() to service_role;
create trigger file_publication_integrity
before insert or update on public.file_publications
for each row execute function public.validate_file_publication_integrity();

-- Keep unimplemented sensitive domains explicitly deny-by-default.
alter table public.counseling_sessions enable row level security;

do $$
declare item record;
begin
  for item in select * from (values
    ('counselor_assignments'::text, 'counselor_assignments_deny_all'::text),
    ('counselor_permissions', 'counselor_permissions_deny_all'),
    ('counseling_sessions', 'counseling_sessions_deny_all'),
    ('file_publications', 'file_publications_deny_all'),
    ('assessment_assignments', 'assessment_assignments_deny_all'),
    ('assessment_attempts', 'assessment_attempts_deny_all'),
    ('assessment_answers', 'assessment_answers_deny_all'),
    ('assessment_result_snapshots', 'assessment_result_snapshots_deny_all'),
    ('assessment_answer_keys', 'assessment_answer_keys_deny_all'),
    ('assessment_scoring_configs', 'assessment_scoring_configs_deny_all'),
    ('quiz_answer_keys', 'quiz_answer_keys_deny_all')
  ) as x(table_name, policy_name) loop
    if not exists (select 1 from pg_catalog.pg_policies p where p.schemaname='public' and p.tablename=item.table_name and p.policyname=item.policy_name) then
      execute format('create policy %I on public.%I as restrictive for all to authenticated using (false) with check (false)', item.policy_name, item.table_name);
    end if;
  end loop;
end $$;
