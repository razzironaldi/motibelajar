create or replace function public.create_counseling_follow_up(p_session_id uuid,p_action text,p_due_at timestamptz,p_owner_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare sid uuid; followup_id uuid;
begin
  if p_owner_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select student_id into sid from public.counseling_sessions where id=p_session_id;
  if sid is null or not public.counseling_actor_can_manage(p_owner_id,sid) then raise exception 'follow-up not authorized'; end if;
  if char_length(trim(p_action))=0 or p_due_at<=now() then raise exception 'invalid follow-up'; end if;
  insert into public.counseling_follow_ups(session_id,action,due_at,owner_id) values(p_session_id,left(trim(p_action),500),p_due_at,p_owner_id) returning id into followup_id;
  return followup_id;
end $$;
revoke all on function public.create_counseling_follow_up(uuid,text,timestamptz,uuid) from public; grant execute on function public.create_counseling_follow_up(uuid,text,timestamptz,uuid) to authenticated;

create or replace function public.update_counseling_follow_up(p_follow_up_id uuid,p_status text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare followup_id uuid;
begin
  if p_status not in ('open','due','completed','closed') then raise exception 'invalid follow-up status'; end if;
  update public.counseling_follow_ups set status=p_status,completed_at=case when p_status='completed' then now() else completed_at end where id=p_follow_up_id and owner_id=(select auth.uid()) returning id into followup_id;
  if followup_id is null then raise exception 'follow-up not authorized'; end if;
  return followup_id;
end $$;
revoke all on function public.update_counseling_follow_up(uuid,text) from public; grant execute on function public.update_counseling_follow_up(uuid,text) to authenticated;
