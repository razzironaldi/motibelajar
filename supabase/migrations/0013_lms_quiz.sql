create table public.lms_quiz_assignments (id uuid primary key default gen_random_uuid(), quiz_id uuid not null references public.quizzes(id) on delete restrict, course_id uuid not null references public.lms_courses(id) on delete restrict, student_id uuid not null references public.profiles(id) on delete restrict, attempt_limit int not null default 1 check(attempt_limit between 1 and 3), status text not null default 'active' check(status in ('active','closed')), unique(quiz_id,student_id));
create table public.lms_quiz_attempts (id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.lms_quiz_assignments(id) on delete restrict, student_id uuid not null references public.profiles(id) on delete restrict, status text not null default 'submitted', score_protected jsonb not null default '{}'::jsonb, submitted_at timestamptz not null default now());
revoke all on public.lms_quiz_assignments,public.lms_quiz_attempts from anon,authenticated;
grant select on public.lms_quiz_assignments,public.lms_quiz_attempts to authenticated;
alter table public.lms_quiz_assignments enable row level security;
alter table public.lms_quiz_attempts enable row level security;
create policy lms_quiz_assignment_student_read on public.lms_quiz_assignments for select to authenticated using(student_id=(select auth.uid()) and status='active');
create policy lms_quiz_attempt_student_read on public.lms_quiz_attempts for select to authenticated using(student_id=(select auth.uid()));

create or replace function public.student_quiz_questions(p_assignment_id uuid)
returns table(question_id uuid,prompt text,option_id uuid,option_label text,order_no int)
language sql security definer set search_path=pg_catalog,public as $$
 select q.id,coalesce(v.prompt_snapshot,q.prompt),o.id,o.label,q.order_no
 from public.lms_quiz_assignments a join public.quizzes z on z.id=a.quiz_id
 join public.quiz_questions q on q.quiz_id=z.id join public.quiz_question_versions v on v.quiz_question_id=q.id
 left join public.quiz_options o on o.quiz_question_version_id=v.id
 where a.id=p_assignment_id and a.student_id=(select auth.uid()) and a.status='active' and z.status='published' and v.published_at is not null
 order by q.order_no,o.id
$$;
revoke all on function public.student_quiz_questions(uuid) from public;
grant execute on function public.student_quiz_questions(uuid) to authenticated;

create or replace function public.submit_student_quiz(p_assignment_id uuid,p_student_id uuid,p_answers jsonb)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare aid uuid; attempt_id uuid; total numeric:=0; item jsonb; key record; attempts int;
begin
 if p_student_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
 select id,attempt_limit into aid,attempts from public.lms_quiz_assignments where id=p_assignment_id and student_id=p_student_id and status='active' for update;
 if aid is null then raise exception 'quiz unavailable'; end if;
 if (select count(*) from public.lms_quiz_attempts where assignment_id=aid)>=attempts then raise exception 'attempt limit reached'; end if;
 for item in select * from jsonb_array_elements(coalesce(p_answers,'[]'::jsonb)) loop
  select k.* into key from public.quiz_answer_keys k where k.quiz_question_version_id=(item->>'versionId')::uuid;
  if key.id is not null and (item->>'optionId')::uuid=any(key.correct_option_ids_protected) then total:=total+coalesce((key.scoring_config_protected->>'points')::numeric,1); end if;
 end loop;
 insert into public.lms_quiz_attempts(assignment_id,student_id,score_protected) values(aid,p_student_id,jsonb_build_object('points',total)) returning id into attempt_id;
 return attempt_id;
end
$$;
revoke all on function public.submit_student_quiz(uuid,uuid,jsonb) from public;
grant execute on function public.submit_student_quiz(uuid,uuid,jsonb) to authenticated;
