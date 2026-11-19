-- Counseling request, scheduling, summary and sharing lifecycle. Local/demo only.
create or replace function public.current_primary_bk(p_student_id uuid)
returns uuid language sql stable security definer set search_path=pg_catalog,public
as $$ select ca.counselor_id from public.counselor_assignments ca where ca.student_id=p_student_id and ca.assignment_type='primary' and ca.active=true and p_student_id=(select auth.uid()) limit 1 $$;
revoke all on function public.current_primary_bk(uuid) from public;
grant execute on function public.current_primary_bk(uuid) to authenticated;

alter table public.counseling_sessions
  add column if not exists appointment_id uuid unique,
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists attendance_status text,
  add column if not exists escalation_status text;

create table public.counseling_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  assigned_counselor_id uuid not null references public.profiles(id) on delete restrict,
  reason text not null check (char_length(reason) between 1 and 2000),
  category text not null check (category in ('belajar','pribadi','sosial','karier','lainnya')),
  urgency text not null default 'normal' check (urgency in ('normal','segera')),
  availability_json jsonb not null default '{}'::jsonb,
  sharing_json jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted','reviewed','slot_offered','confirmed','completed','cancelled','declined','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index counseling_requests_student_idx on public.counseling_requests(student_id, created_at desc);
create index counseling_requests_counselor_idx on public.counseling_requests(assigned_counselor_id, status, created_at desc);

create table public.counseling_slots (
  id uuid primary key default gen_random_uuid(),
  counselor_id uuid not null references public.profiles(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  channel text not null check (channel in ('onsite','online')),
  location_ref text not null default '' check (char_length(location_ref) <= 240),
  status text not null default 'open' check (status in ('open','offered','booked','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (starts_at > created_at)
);
create index counseling_slots_counselor_idx on public.counseling_slots(counselor_id, starts_at);

create table public.counseling_appointments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.counseling_requests(id) on delete restrict,
  slot_id uuid not null references public.counseling_slots(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  counselor_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'offered' check (status in ('offered','confirmed','rescheduled','cancelled','completed','no_show')),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text check (cancellation_reason is null or char_length(cancellation_reason) <= 500),
  created_at timestamptz not null default now(),
  unique(slot_id)
);
create index counseling_appointments_student_idx on public.counseling_appointments(student_id, created_at desc);
create index counseling_appointments_counselor_idx on public.counseling_appointments(counselor_id, created_at desc);

create table public.counseling_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.counseling_sessions(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 2000),
  published_by uuid references public.profiles(id) on delete restrict,
  published_at timestamptz,
  revoked_at timestamptz,
  visible_to_student boolean not null default false,
  revision_no int not null default 1 check (revision_no > 0),
  created_at timestamptz not null default now()
);

create table public.counseling_follow_ups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.counseling_sessions(id) on delete restrict,
  action text not null check (char_length(action) between 1 and 500),
  due_at timestamptz not null,
  status text not null default 'open' check (status in ('open','due','completed','closed')),
  completed_at timestamptz,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index counseling_follow_ups_owner_idx on public.counseling_follow_ups(owner_id, status, due_at);

create table public.sharing_permissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  resource_type text not null check (resource_type in ('weekly_reflection','goal','achievement')),
  resource_id uuid not null,
  grantee_id uuid not null references public.profiles(id) on delete restrict,
  scope_json jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index sharing_permission_active_idx on public.sharing_permissions(student_id, resource_type, resource_id, grantee_id) where revoked_at is null;

alter table public.counseling_requests enable row level security;
alter table public.counseling_slots enable row level security;
alter table public.counseling_appointments enable row level security;
alter table public.counseling_summaries enable row level security;
alter table public.counseling_follow_ups enable row level security;
alter table public.sharing_permissions enable row level security;
do $$ declare t text; begin
  foreach t in array array['counseling_requests','counseling_slots','counseling_appointments','counseling_summaries','counseling_follow_ups','sharing_permissions'] loop
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;
grant select, insert on public.counseling_requests to authenticated;
grant select on public.counseling_slots to authenticated;
grant select, update on public.counseling_appointments to authenticated;
grant select on public.counseling_summaries to authenticated;
grant select, insert, update on public.counseling_follow_ups to authenticated;
grant select, insert, update on public.sharing_permissions to authenticated;

create policy counseling_requests_student_read on public.counseling_requests for select to authenticated using (student_id=(select auth.uid()));
create policy counseling_requests_student_insert on public.counseling_requests for insert to authenticated with check (
  student_id=(select auth.uid()) and public.current_primary_bk((select auth.uid()))=assigned_counselor_id
);
create policy counseling_requests_assigned_bk_read on public.counseling_requests for select to authenticated using (assigned_counselor_id=(select auth.uid()) and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='bk_teacher' and p.active));
create policy counseling_slots_bk_read on public.counseling_slots for select to authenticated using (counselor_id=(select auth.uid()));
create policy counseling_slots_student_read on public.counseling_slots for select to authenticated using (status='open' and exists (select 1 from public.counselor_assignments ca where ca.student_id=(select auth.uid()) and ca.counselor_id=counselor_id and ca.assignment_type='primary' and ca.active=true));
create policy counseling_appointments_student_read on public.counseling_appointments for select to authenticated using (student_id=(select auth.uid()));
create policy counseling_appointments_bk_read on public.counseling_appointments for select to authenticated using (counselor_id=(select auth.uid()));
create policy counseling_appointments_student_update on public.counseling_appointments for update to authenticated using (student_id=(select auth.uid())) with check (student_id=(select auth.uid()));
create policy counseling_summaries_student_read on public.counseling_summaries for select to authenticated using (visible_to_student=true and revoked_at is null and exists (select 1 from public.counseling_sessions cs where cs.id=session_id and cs.student_id=(select auth.uid())));
create policy counseling_summaries_bk_read on public.counseling_summaries for select to authenticated using (exists (select 1 from public.counseling_sessions cs where cs.id=session_id and cs.counselor_id=(select auth.uid())));
create policy counseling_followups_owner_read on public.counseling_follow_ups for select to authenticated using (owner_id=(select auth.uid()));
create policy sharing_permissions_student_read on public.sharing_permissions for select to authenticated using (student_id=(select auth.uid()));
create policy sharing_permissions_student_insert on public.sharing_permissions for insert to authenticated with check (student_id=(select auth.uid()));
create policy sharing_permissions_student_update on public.sharing_permissions for update to authenticated using (student_id=(select auth.uid())) with check (student_id=(select auth.uid()));

create or replace function public.touch_counseling_request() returns trigger language plpgsql set search_path=pg_catalog,public as $$ begin new.updated_at=now(); return new; end $$;
create trigger counseling_requests_touch before update on public.counseling_requests for each row execute function public.touch_counseling_request();

create or replace function public.validate_counseling_appointment_integrity() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if not exists (select 1 from public.counseling_requests r where r.id=new.request_id and r.student_id=new.student_id and r.assigned_counselor_id=new.counselor_id) then raise exception 'appointment does not match request'; end if;
  if not exists (select 1 from public.counseling_slots s where s.id=new.slot_id and s.counselor_id=new.counselor_id and s.status in ('open','offered')) then raise exception 'slot unavailable'; end if;
  return new;
end $$;
revoke all on function public.validate_counseling_appointment_integrity() from public;
create trigger counseling_appointment_integrity before insert or update on public.counseling_appointments for each row execute function public.validate_counseling_appointment_integrity();

create or replace function public.validate_counseling_summary_integrity() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if new.visible_to_student and (new.published_by is null or new.published_at is null) then raise exception 'published summary requires actor and timestamp'; end if;
  if new.published_by is not null and not exists (select 1 from public.counseling_sessions cs where cs.id=new.session_id and cs.counselor_id=new.published_by) then raise exception 'summary actor is not session counselor'; end if;
  return new;
end $$;
revoke all on function public.validate_counseling_summary_integrity() from public;
create trigger counseling_summary_integrity before insert or update on public.counseling_summaries for each row execute function public.validate_counseling_summary_integrity();

comment on table public.counseling_notes is 'Private BK notes. No browser policy; accessed only by authorized server workflow.';
