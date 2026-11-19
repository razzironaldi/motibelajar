-- Counseling lifecycle: transactional booking, revisioned notes, audited publication.
create or replace function public.create_counseling_slot(p_counselor_id uuid, p_starts_at timestamptz, p_ends_at timestamptz, p_channel text, p_location_ref text default '')
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare slot_id uuid;
begin
  if p_counselor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  if not exists (select 1 from public.profiles where id=p_counselor_id and role='bk_teacher' and active) then raise exception 'not authorized'; end if;
  if p_ends_at<=p_starts_at or p_starts_at<=now() or p_channel not in ('onsite','online') then raise exception 'invalid slot'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_counselor_id::text, 918273645));
  if exists (select 1 from public.counseling_slots where counselor_id=p_counselor_id and status<>'cancelled' and tstzrange(starts_at,ends_at,'[)') && tstzrange(p_starts_at,p_ends_at,'[)')) then raise exception 'slot overlaps'; end if;
  insert into public.counseling_slots(counselor_id,starts_at,ends_at,channel,location_ref) values(p_counselor_id,p_starts_at,p_ends_at,p_channel,left(coalesce(p_location_ref,''),240)) returning id into slot_id;
  return slot_id;
end $$;
revoke all on function public.create_counseling_slot(uuid,timestamptz,timestamptz,text,text) from public;
grant execute on function public.create_counseling_slot(uuid,timestamptz,timestamptz,text,text) to authenticated;

create table public.counseling_slot_overlap_guard (dummy boolean primary key default true);
-- The RPC locks the counselor's slot set through the transaction; overlapping slots are rejected before insert.

create or replace function public.counseling_actor_can_manage(p_counselor_id uuid, p_student_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public
as $$ select p_counselor_id=(select auth.uid()) and exists (select 1 from public.profiles p where p.id=p_counselor_id and p.role='bk_teacher' and p.active) and exists (select 1 from public.counselor_assignments ca where ca.counselor_id=p_counselor_id and ca.student_id=p_student_id and ca.assignment_type in ('primary','additional') and ca.active=true) $$;
revoke all on function public.counseling_actor_can_manage(uuid,uuid) from public;
grant execute on function public.counseling_actor_can_manage(uuid,uuid) to authenticated;

create table public.counseling_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  event_type text not null check (event_type in ('request_created','slot_offered','appointment_confirmed','appointment_cancelled','appointment_rescheduled','note_created','note_revised','summary_published','summary_revoked')),
  request_id uuid references public.counseling_requests(id) on delete restrict,
  appointment_id uuid references public.counseling_appointments(id) on delete restrict,
  session_id uuid references public.counseling_sessions(id) on delete restrict,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index counseling_audit_actor_idx on public.counseling_audit_events(actor_id, created_at desc);
create index counseling_audit_request_idx on public.counseling_audit_events(request_id, created_at desc);

create table public.counseling_note_revisions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.counseling_notes(id) on delete restrict,
  session_id uuid not null references public.counseling_sessions(id) on delete restrict,
  counselor_id uuid not null references public.profiles(id) on delete restrict,
  body_protected text not null check (char_length(body_protected) between 1 and 10000),
  revision_no int not null check (revision_no > 0),
  created_at timestamptz not null default now(),
  unique(note_id, revision_no)
);
create index counseling_note_revisions_session_idx on public.counseling_note_revisions(session_id, created_at desc);

alter table public.counseling_sessions
  add constraint counseling_sessions_appointment_fk foreign key (appointment_id) references public.counseling_appointments(id) on delete restrict;

alter table public.counseling_audit_events enable row level security;
alter table public.counseling_note_revisions enable row level security;
revoke all on table public.counseling_audit_events, public.counseling_note_revisions from anon, authenticated;
grant select on public.counseling_audit_events to authenticated;
grant select, insert on public.counseling_note_revisions to authenticated;

create policy counseling_audit_actor_read on public.counseling_audit_events for select to authenticated using (actor_id=(select auth.uid()));
create policy counseling_note_revisions_bk_read on public.counseling_note_revisions for select to authenticated using (counselor_id=(select auth.uid()));
create policy counseling_note_revisions_bk_insert on public.counseling_note_revisions for insert to authenticated with check (counselor_id=(select auth.uid()));

create or replace function public.counseling_actor_can_manage(p_counselor_id uuid, p_student_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public
as $$ select p_counselor_id=(select auth.uid()) and exists (select 1 from public.profiles p where p.id=p_counselor_id and p.role='bk_teacher' and p.active) and exists (select 1 from public.counselor_assignments ca where ca.counselor_id=p_counselor_id and ca.student_id=p_student_id and ca.assignment_type in ('primary','additional') and ca.active=true) $$;
revoke all on function public.counseling_actor_can_manage(uuid,uuid) from public;
grant execute on function public.counseling_actor_can_manage(uuid,uuid) to authenticated;

create or replace function public.offer_counseling_slot(p_request_id uuid, p_slot_id uuid, p_counselor_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare r public.counseling_requests; s public.counseling_slots; a public.counseling_appointments;
begin
  if p_counselor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select * into r from public.counseling_requests where id=p_request_id for update;
  if r.id is null or not public.counseling_actor_can_manage(p_counselor_id,r.student_id) or r.assigned_counselor_id<>p_counselor_id then raise exception 'request not authorized'; end if;
  select * into s from public.counseling_slots where id=p_slot_id for update;
  if s.id is null or s.counselor_id<>p_counselor_id or s.status<>'open' then raise exception 'slot unavailable'; end if;
  insert into public.counseling_appointments(request_id,slot_id,student_id,counselor_id,status) values (r.id,s.id,r.student_id,p_counselor_id,'offered') returning * into a;
  update public.counseling_slots set status='offered' where id=s.id;
  update public.counseling_requests set status='slot_offered' where id=r.id;
  insert into public.counseling_audit_events(actor_id,event_type,request_id,appointment_id,metadata) values (p_counselor_id,'slot_offered',r.id,a.id,jsonb_build_object('slot_id',s.id));
  return a.id;
end $$;
revoke all on function public.offer_counseling_slot(uuid,uuid,uuid) from public;
grant execute on function public.offer_counseling_slot(uuid,uuid,uuid) to authenticated;

create or replace function public.confirm_counseling_appointment(p_appointment_id uuid, p_student_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare a public.counseling_appointments; s public.counseling_slots;
begin
  if p_student_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select * into a from public.counseling_appointments where id=p_appointment_id for update;
  if a.id is null or a.student_id<>p_student_id or a.status<>'offered' then raise exception 'appointment not confirmable'; end if;
  select * into s from public.counseling_slots where id=a.slot_id for update;
  if s.status<>'offered' then raise exception 'slot unavailable'; end if;
  update public.counseling_appointments set status='confirmed', confirmed_at=now() where id=a.id;
  update public.counseling_requests set status='confirmed' where id=a.request_id;
  insert into public.counseling_audit_events(actor_id,event_type,request_id,appointment_id,metadata) values (p_student_id,'appointment_confirmed',a.request_id,a.id,'{}');
  return a.id;
end $$;
revoke all on function public.confirm_counseling_appointment(uuid,uuid) from public;
grant execute on function public.confirm_counseling_appointment(uuid,uuid) to authenticated;

create or replace function public.cancel_counseling_appointment(p_appointment_id uuid, p_actor_id uuid, p_reason text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare a public.counseling_appointments; s public.counseling_slots;
begin
  if p_actor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select * into a from public.counseling_appointments where id=p_appointment_id for update;
  if a.id is null or (a.student_id<>p_actor_id and not public.counseling_actor_can_manage(a.counselor_id,a.student_id)) then raise exception 'appointment not authorized'; end if;
  select * into s from public.counseling_slots where id=a.slot_id for update;
  update public.counseling_appointments set status='cancelled', cancelled_at=now(), cancellation_reason=left(coalesce(p_reason,''),500) where id=a.id;
  update public.counseling_slots set status='open' where id=s.id and status in ('offered','booked');
  update public.counseling_requests set status='cancelled' where id=a.request_id;
  insert into public.counseling_audit_events(actor_id,event_type,request_id,appointment_id,metadata) values (p_actor_id,'appointment_cancelled',a.request_id,a.id,jsonb_build_object('reason',left(coalesce(p_reason,''),500)));
  return a.id;
end $$;
revoke all on function public.cancel_counseling_appointment(uuid,uuid,text) from public;
grant execute on function public.cancel_counseling_appointment(uuid,uuid,text) to authenticated;

create or replace function public.reschedule_counseling_appointment(p_appointment_id uuid, p_actor_id uuid, p_new_slot_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare a public.counseling_appointments; old_s public.counseling_slots; new_s public.counseling_slots;
begin
  if p_actor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select * into a from public.counseling_appointments where id=p_appointment_id for update;
  if a.id is null or (a.student_id<>p_actor_id and not public.counseling_actor_can_manage(a.counselor_id,a.student_id)) then raise exception 'appointment not authorized'; end if;
  select * into old_s from public.counseling_slots where id=a.slot_id for update;
  select * into new_s from public.counseling_slots where id=p_new_slot_id for update;
  if new_s.id is null or new_s.counselor_id<>a.counselor_id or new_s.status<>'open' then raise exception 'new slot unavailable'; end if;
  update public.counseling_slots set status='open' where id=old_s.id;
  update public.counseling_slots set status='offered' where id=new_s.id;
  update public.counseling_appointments set slot_id=new_s.id, status='rescheduled', confirmed_at=null where id=a.id;
  update public.counseling_requests set status='slot_offered' where id=a.request_id;
  insert into public.counseling_audit_events(actor_id,event_type,request_id,appointment_id,metadata) values (p_actor_id,'appointment_rescheduled',a.request_id,a.id,jsonb_build_object('old_slot_id',old_s.id,'new_slot_id',new_s.id));
  return a.id;
end $$;
revoke all on function public.reschedule_counseling_appointment(uuid,uuid,uuid) from public;
grant execute on function public.reschedule_counseling_appointment(uuid,uuid,uuid) to authenticated;

create or replace function public.create_counseling_note(p_session_id uuid, p_counselor_id uuid, p_body text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare n public.counseling_notes; sid uuid;
begin
  if p_counselor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select student_id into sid from public.counseling_sessions where id=p_session_id;
  if sid is null or not public.counseling_actor_can_manage(p_counselor_id,sid) then raise exception 'session not authorized'; end if;
  insert into public.counseling_notes(session_id,counselor_id,body_protected) values(p_session_id,p_counselor_id,p_body) returning * into n;
  insert into public.counseling_note_revisions(note_id,session_id,counselor_id,body_protected,revision_no) values(n.id,p_session_id,p_counselor_id,p_body,1);
  insert into public.counseling_audit_events(actor_id,event_type,session_id,metadata) values(p_counselor_id,'note_created',p_session_id,jsonb_build_object('note_id',n.id,'revision_no',1));
  return n.id;
end $$;
revoke all on function public.create_counseling_note(uuid,uuid,text) from public;
grant execute on function public.create_counseling_note(uuid,uuid,text) to authenticated;

create or replace function public.revise_counseling_note(p_note_id uuid, p_counselor_id uuid, p_body text)
returns int language plpgsql security definer set search_path=pg_catalog,public
as $$
declare n public.counseling_notes; sid uuid; next_revision int;
begin
  if p_counselor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select * into n from public.counseling_notes where id=p_note_id for update;
  select student_id into sid from public.counseling_sessions where id=n.session_id;
  if n.id is null or n.counselor_id<>p_counselor_id or not public.counseling_actor_can_manage(p_counselor_id,sid) then raise exception 'note not authorized'; end if;
  next_revision:=n.revision_no+1;
  update public.counseling_notes set body_protected=p_body, revision_no=next_revision where id=n.id;
  insert into public.counseling_note_revisions(note_id,session_id,counselor_id,body_protected,revision_no) values(n.id,n.session_id,p_counselor_id,p_body,next_revision);
  insert into public.counseling_audit_events(actor_id,event_type,session_id,metadata) values(p_counselor_id,'note_revised',n.session_id,jsonb_build_object('note_id',n.id,'revision_no',next_revision));
  return next_revision;
end $$;
revoke all on function public.revise_counseling_note(uuid,uuid,text) from public;
grant execute on function public.revise_counseling_note(uuid,uuid,text) to authenticated;

create or replace function public.publish_counseling_summary(p_session_id uuid, p_actor_id uuid, p_body text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare s public.counseling_sessions; summary_id uuid;
begin
  if p_actor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select * into s from public.counseling_sessions where id=p_session_id;
  if s.id is null or s.counselor_id<>p_actor_id or not public.counseling_actor_can_manage(p_actor_id,s.student_id) then raise exception 'summary not authorized'; end if;
  insert into public.counseling_summaries(session_id,body,published_by,published_at,visible_to_student) values(p_session_id,p_body,p_actor_id,now(),true) on conflict(session_id) do update set body=excluded.body,published_by=excluded.published_by,published_at=excluded.published_at,revoked_at=null,visible_to_student=true,revision_no=public.counseling_summaries.revision_no+1 returning id into summary_id;
  insert into public.counseling_audit_events(actor_id,event_type,session_id,metadata) values(p_actor_id,'summary_published',p_session_id,jsonb_build_object('summary_id',summary_id));
  return summary_id;
end $$;
revoke all on function public.publish_counseling_summary(uuid,uuid,text) from public;
grant execute on function public.publish_counseling_summary(uuid,uuid,text) to authenticated;

create or replace function public.revoke_counseling_summary(p_session_id uuid, p_actor_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,public
as $$
declare sid uuid;
begin
  if p_actor_id<>(select auth.uid()) then raise exception 'actor mismatch'; end if;
  select counselor_id into sid from public.counseling_sessions where id=p_session_id;
  if sid is null or sid<>p_actor_id then raise exception 'summary not authorized'; end if;
  update public.counseling_summaries set visible_to_student=false,revoked_at=now() where session_id=p_session_id returning id into sid;
  if sid is null then raise exception 'summary not found'; end if;
  insert into public.counseling_audit_events(actor_id,event_type,session_id,metadata) values(p_actor_id,'summary_revoked',p_session_id,jsonb_build_object('summary_id',sid));
  return sid;
end $$;
revoke all on function public.revoke_counseling_summary(uuid,uuid) from public;
grant execute on function public.revoke_counseling_summary(uuid,uuid) to authenticated;
