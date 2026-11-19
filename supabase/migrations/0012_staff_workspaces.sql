alter type public.app_role add value if not exists 'reviewer';

create or replace function public.reviewer_assignments()
returns table(assignment_id uuid, assessment_version_id uuid, assessment_name text, version_no int, permission text, assigned_at timestamptz, decided_at timestamptz)
language sql security definer set search_path=pg_catalog,public as $$
  select r.id, r.assessment_version_id, a.name, v.version_no, r.permission, r.assigned_at, r.decided_at
  from public.assessment_review_assignments r
  join public.assessment_versions v on v.id=r.assessment_version_id
  join public.assessments a on a.id=v.assessment_id
  where r.reviewer_id=(select auth.uid())
  order by r.assigned_at desc
$$;
revoke all on function public.reviewer_assignments() from public;
grant execute on function public.reviewer_assignments() to authenticated;

create or replace function public.decide_assessment_review(p_assignment_id uuid,p_decision text,p_comment text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_id uuid; result_id uuid;
begin
  if (select role from public.profiles where id=(select auth.uid())) <> 'reviewer' then raise exception 'not authorized'; end if;
  if p_decision not in ('approved','rejected') then raise exception 'invalid decision'; end if;
  select assessment_version_id into v_id from public.assessment_review_assignments where id=p_assignment_id and reviewer_id=(select auth.uid()) for update;
  if v_id is null then raise exception 'review assignment not found'; end if;
  insert into public.assessment_approvals(assessment_version_id,reviewer_id,decision,comment)
  values(v_id,(select auth.uid()),p_decision,left(coalesce(p_comment,''),2000)) returning id into result_id;
  update public.assessment_review_assignments set decided_at=now() where id=p_assignment_id;
  return result_id;
end
$$;
revoke all on function public.decide_assessment_review(uuid,text,text) from public;
grant execute on function public.decide_assessment_review(uuid,text,text) to authenticated;

create or replace function public.admin_workspace_summary()
returns table(metric text,value bigint)
language sql security definer set search_path=pg_catalog,public as $$
  select 'active_students', count(*) from public.profiles where role='student' and active
  union all select 'open_counseling_requests', count(*) from public.counseling_requests where status in ('submitted','in_review')
  union all select 'published_courses', count(*) from public.lms_courses where status='published'
  union all select 'pending_reviews', count(*) from public.assessment_review_assignments where decided_at is null
$$;
revoke all on function public.admin_workspace_summary() from public;
grant execute on function public.admin_workspace_summary() to authenticated;
