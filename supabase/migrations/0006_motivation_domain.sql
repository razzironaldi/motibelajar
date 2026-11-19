create table public.motivation_instruments (id uuid primary key default gen_random_uuid(), name text not null, description text not null default '', active boolean not null default false, created_at timestamptz not null default now());
create table public.motivation_versions (id uuid primary key default gen_random_uuid(), instrument_id uuid not null references public.motivation_instruments(id) on delete restrict, version_no int not null, status text not null default 'draft' check (status in ('draft','published','archived')), interpretation_schema jsonb not null default '{}'::jsonb, published_at timestamptz, unique(instrument_id,version_no));
create table public.motivation_questions (id uuid primary key default gen_random_uuid(), version_id uuid not null references public.motivation_versions(id) on delete restrict, prompt text not null, dimension text not null, order_no int not null, unique(version_id,order_no));
create table public.motivation_attempts (id uuid primary key default gen_random_uuid(), version_id uuid not null references public.motivation_versions(id) on delete restrict, student_id uuid not null references public.profiles(id) on delete restrict, status text not null default 'draft' check(status in ('draft','submitted')), submitted_at timestamptz, unique(id,student_id));
create table public.motivation_answers (id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.motivation_attempts(id) on delete restrict, question_id uuid not null references public.motivation_questions(id) on delete restrict, value int not null check(value between 1 and 4), unique(attempt_id,question_id));
create table public.motivation_result_snapshots (id uuid primary key default gen_random_uuid(), attempt_id uuid not null unique references public.motivation_attempts(id) on delete restrict, total_score int not null, interpretation text not null, submitted_at timestamptz not null default now());
create table public.motivation_aggregates (id uuid primary key default gen_random_uuid(), instrument_version_id uuid not null references public.motivation_versions(id) on delete restrict, cohort_key text not null, cohort_size int not null check(cohort_size>=5), average_score numeric not null, generated_at timestamptz not null default now());

do $$ declare t text; begin foreach t in array array['motivation_instruments','motivation_versions','motivation_questions','motivation_attempts','motivation_answers','motivation_result_snapshots','motivation_aggregates'] loop execute format('alter table public.%I enable row level security',t); execute format('revoke all on table public.%I from anon,authenticated',t); end loop; end $$;
grant select,insert on public.motivation_attempts,public.motivation_answers to authenticated;
grant select on public.motivation_instruments,public.motivation_versions,public.motivation_questions,public.motivation_result_snapshots,public.motivation_aggregates to authenticated;
create policy motivation_published_read on public.motivation_instruments for select to authenticated using(active=true);
create policy motivation_version_read on public.motivation_versions for select to authenticated using(status='published');
create policy motivation_question_read on public.motivation_questions for select to authenticated using(exists(select 1 from public.motivation_versions v where v.id=version_id and v.status='published'));
create policy motivation_attempt_own on public.motivation_attempts for select to authenticated using(student_id=(select auth.uid()));
create policy motivation_attempt_insert on public.motivation_attempts for insert to authenticated with check(student_id=(select auth.uid()) and exists(select 1 from public.motivation_versions v where v.id=version_id and v.status='published'));
create policy motivation_answer_own on public.motivation_answers for all to authenticated using(exists(select 1 from public.motivation_attempts a where a.id=attempt_id and a.student_id=(select auth.uid()) and a.status='draft')) with check(exists(select 1 from public.motivation_attempts a where a.id=attempt_id and a.student_id=(select auth.uid()) and a.status='draft'));
create policy motivation_result_own on public.motivation_result_snapshots for select to authenticated using(exists(select 1 from public.motivation_attempts a where a.id=attempt_id and a.student_id=(select auth.uid())));
create policy motivation_aggregate_read on public.motivation_aggregates for select to authenticated using(cohort_size>=5);

create or replace function public.submit_motivation_attempt(p_attempt_id uuid,p_student_id uuid) returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$ declare a public.motivation_attempts; q int; total int; r uuid; begin if p_student_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if; select * into a from public.motivation_attempts where id=p_attempt_id for update; if a.id is null or a.student_id<>p_student_id or a.status<>'draft' then raise exception 'attempt not submittable'; end if; select count(*),coalesce(sum(value),0) into q,total from public.motivation_answers where attempt_id=a.id; if q=0 then raise exception 'answers required'; end if; update public.motivation_attempts set status='submitted',submitted_at=now() where id=a.id; insert into public.motivation_result_snapshots(attempt_id,total_score,interpretation) values(a.id,total,case when total<q*2 then 'Deskriptif: motivasi sedang perlu dukungan' when total<q*3 then 'Deskriptif: motivasi sedang berkembang' else 'Deskriptif: motivasi kuat dan konsisten' end) returning id into r; return r; end $$;
revoke all on function public.submit_motivation_attempt(uuid,uuid) from public; grant execute on function public.submit_motivation_attempt(uuid,uuid) to authenticated;

create or replace function public.submit_motivation_answers(p_version_id uuid, p_student_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare attempt_id uuid; result_id uuid; item jsonb;
begin
  if p_student_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  if not exists (select 1 from public.motivation_versions where id=p_version_id and status='published') then raise exception 'version unavailable'; end if;
  if jsonb_typeof(p_answers)<>'array' or jsonb_array_length(p_answers)=0 then raise exception 'answers required'; end if;
  insert into public.motivation_attempts(version_id,student_id) values(p_version_id,p_student_id) returning id into attempt_id;
  for item in select * from jsonb_array_elements(p_answers) loop
    if not ((item->>'value')::int between 1 and 4) then raise exception 'answer value invalid'; end if;
    insert into public.motivation_answers(attempt_id,question_id,value) values(attempt_id,(item->>'questionId')::uuid,(item->>'value')::int);
  end loop;
  result_id:=public.submit_motivation_attempt(attempt_id,p_student_id);
  return jsonb_build_object('attemptId',attempt_id,'resultId',result_id);
end $$;
revoke all on function public.submit_motivation_answers(uuid,uuid,jsonb) from public; grant execute on function public.submit_motivation_answers(uuid,uuid,jsonb) to authenticated;
