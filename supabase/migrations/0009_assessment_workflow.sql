create or replace function public.assessment_student_questions(p_assignment_id uuid)
returns table(question_id uuid, prompt text, type text, dimension text, order_no int, option_id uuid, option_label text)
language sql security definer set search_path=pg_catalog,public as $$
  select q.id,q.prompt,q.type,q.dimension,q.order_no,o.id,o.label
  from public.assessment_assignments a
  join public.assessment_questions q on q.version_id=a.version_id
  left join public.assessment_options o on o.question_id=q.id
  where a.id=p_assignment_id and a.student_id=(select auth.uid()) and (a.opens_at is null or a.opens_at<=now()) and (a.closes_at is null or a.closes_at>=now())
  order by q.order_no,o.order_no
$$;
revoke all on function public.assessment_student_questions(uuid) from public; grant execute on function public.assessment_student_questions(uuid) to authenticated;

create or replace function public.submit_assessment_attempt(p_assignment_id uuid,p_student_id uuid,p_answers jsonb)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare a public.assessment_assignments; attempt_id uuid; result_id uuid; total numeric:=0; item jsonb; key public.assessment_answer_keys; begin
  if p_student_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select * into a from public.assessment_assignments where id=p_assignment_id and student_id=p_student_id for update;
  if a.id is null or (a.opens_at is not null and a.opens_at>now()) or (a.closes_at is not null and a.closes_at<now()) then raise exception 'assignment unavailable'; end if;
  if (select count(*) from public.assessment_attempts where assignment_id=a.id and status='submitted')>=a.attempt_limit then raise exception 'attempt limit reached'; end if;
  insert into public.assessment_attempts(assignment_id,student_id,version_id,status) values(a.id,p_student_id,a.version_id,'draft') returning id into attempt_id;
  for item in select * from jsonb_array_elements(coalesce(p_answers,'[]'::jsonb)) loop
    insert into public.assessment_answers(attempt_id,question_id,option_id,value_json) values(attempt_id,(item->>'questionId')::uuid,(item->>'optionId')::uuid,coalesce(item->'value','null'::jsonb));
    select k.* into key from public.assessment_answer_keys k where k.assessment_question_id=(item->>'questionId')::uuid;
    if key.id is not null and (item->>'optionId')::uuid=any(key.correct_option_ids_protected) then total:=total+coalesce((key.scoring_value_protected->>'points')::numeric,1); end if;
  end loop;
  update public.assessment_attempts set status='submitted',submitted_at=now() where id=attempt_id;
  insert into public.assessment_result_snapshots(attempt_id,score_protected,interpretation_protected) values(attempt_id,jsonb_build_object('points',total),jsonb_build_object('mode','descriptive')) returning id into result_id;
  return result_id;
end $$;
revoke all on function public.submit_assessment_attempt(uuid,uuid,jsonb) from public; grant execute on function public.submit_assessment_attempt(uuid,uuid,jsonb) to authenticated;

create policy assessment_assignment_student_read on public.assessment_assignments for select to authenticated using(student_id=(select auth.uid()));
create policy assessment_attempt_student_read on public.assessment_attempts for select to authenticated using(student_id=(select auth.uid()));
create policy assessment_answer_student_read on public.assessment_answers for select to authenticated using(exists(select 1 from public.assessment_attempts a where a.id=attempt_id and a.student_id=(select auth.uid())));
create policy assessment_result_student_read on public.assessment_result_snapshots for select to authenticated using(exists(select 1 from public.assessment_attempts a where a.id=attempt_id and a.student_id=(select auth.uid())));
revoke all on public.assessment_assignments,public.assessment_attempts,public.assessment_answers,public.assessment_result_snapshots from anon,authenticated;
grant select on public.assessment_assignments,public.assessment_attempts,public.assessment_answers,public.assessment_result_snapshots to authenticated;
