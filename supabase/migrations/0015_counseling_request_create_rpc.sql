-- Actor-bound counseling request creation avoids exposing profile columns for FK/policy checks.
create or replace function public.create_counseling_request(
  p_category text,
  p_urgency text,
  p_reason text,
  p_availability_json jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path=pg_catalog,public
as $$
declare
  actor uuid := (select auth.uid());
  counselor uuid;
  request_id uuid;
begin
  if actor is null then raise exception 'not authenticated' using errcode='42501'; end if;
  if p_category not in ('belajar','pribadi','sosial','karier','lainnya') then raise exception 'invalid category' using errcode='22023'; end if;
  if p_urgency not in ('normal','segera') then raise exception 'invalid urgency' using errcode='22023'; end if;
  if p_reason is null or char_length(p_reason) not between 1 and 2000 then raise exception 'invalid reason' using errcode='22023'; end if;
  select public.current_primary_bk(actor) into counselor;
  if counselor is null then raise exception 'no assigned counselor' using errcode='23503'; end if;
  insert into public.counseling_requests(student_id, assigned_counselor_id, reason, category, urgency, availability_json)
  values (actor, counselor, p_reason, p_category, p_urgency, coalesce(p_availability_json, '{}'::jsonb))
  returning id into request_id;
  return request_id;
end
$$;
revoke all on function public.create_counseling_request(text,text,text,jsonb) from public;
grant execute on function public.create_counseling_request(text,text,text,jsonb) to authenticated;
