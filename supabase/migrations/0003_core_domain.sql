-- Core student workflows and publication metadata. Local/demo only.
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 2000),
  target_metric text not null check (char_length(target_metric) between 1 and 240),
  deadline date not null,
  status text not null default 'active' check (status in ('active','completed','archived')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goals_student_created_idx on public.goals(student_id, created_at desc);

create table public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete restrict,
  action text not null check (char_length(action) between 1 and 240),
  if_condition text not null default '' check (char_length(if_condition) <= 240),
  then_action text not null default '' check (char_length(then_action) <= 240),
  due_at timestamptz,
  status text not null default 'pending' check (status in ('pending','completed','archived')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index study_plan_items_goal_idx on public.study_plan_items(goal_id, created_at);

create table public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  week_key date not null,
  answers_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','submitted')),
  sharing_status text not null default 'private' check (sharing_status in ('private','shared')),
  revision_no int not null default 1 check (revision_no > 0),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(student_id, week_key, revision_no)
);
create index weekly_reflections_student_idx on public.weekly_reflections(student_id, week_key desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  type text not null check (char_length(type) between 1 and 80),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id uuid,
  safe_summary text not null check (char_length(safe_summary) between 1 and 240),
  read_at timestamptz,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);
create index notifications_recipient_idx on public.notifications(recipient_id, created_at desc);

create or replace function public.publish_file_asset(p_file_asset_id uuid, p_actor_id uuid, p_public_object_path text)
returns public.file_publications
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare result public.file_publications;
begin
  if p_actor_id <> (select auth.uid()) then raise exception 'actor mismatch'; end if;
  if not exists (select 1 from public.profiles where id=p_actor_id and role in ('admin','bk_teacher') and active) then raise exception 'not authorized'; end if;
  if p_public_object_path is null or p_public_object_path !~ '^[a-zA-Z0-9._/-]+$' then raise exception 'invalid public object path'; end if;
  insert into public.file_publications(file_asset_id, published_by, public_object_path, status)
  select p_file_asset_id, p_actor_id, p_public_object_path, 'approved'
  where exists (select 1 from public.file_assets where id=p_file_asset_id and bucket='private-assets' and visibility='private')
  returning * into result;
  if result.id is null then raise exception 'private source asset not found'; end if;
  return result;
end;
$$;
revoke all on function public.publish_file_asset(uuid,uuid,text) from public;
grant execute on function public.publish_file_asset(uuid,uuid,text) to authenticated;

create or replace function public.revoke_file_publication(p_publication_id uuid, p_actor_id uuid)
returns public.file_publications
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare result public.file_publications;
begin
  if p_actor_id <> (select auth.uid()) then raise exception 'actor mismatch'; end if;
  if not exists (select 1 from public.profiles where id=p_actor_id and role in ('admin','bk_teacher') and active) then raise exception 'not authorized'; end if;
  update public.file_publications set status='revoked', revoked_at=now() where id=p_publication_id and status='approved' returning * into result;
  if result.id is null then raise exception 'publication not found'; end if;
  return result;
end;
$$;
revoke all on function public.revoke_file_publication(uuid,uuid) from public;
grant execute on function public.revoke_file_publication(uuid,uuid) to authenticated;

-- RLS and narrow grants.
do $$ declare t text; begin
  foreach t in array array['goals','study_plan_items','weekly_reflections','notifications'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;
grant select, insert, update on public.goals to authenticated;
grant select, insert, update on public.study_plan_items to authenticated;
grant select, insert, update on public.weekly_reflections to authenticated;
grant select, update on public.notifications to authenticated;

create policy goals_own_read on public.goals for select to authenticated using (student_id=(select auth.uid()));
create policy goals_own_insert on public.goals for insert to authenticated with check (student_id=(select auth.uid()));
create policy goals_own_update on public.goals for update to authenticated using (student_id=(select auth.uid())) with check (student_id=(select auth.uid()));
create policy plan_items_own_read on public.study_plan_items for select to authenticated using (exists (select 1 from public.goals g where g.id=goal_id and g.student_id=(select auth.uid())));
create policy plan_items_own_insert on public.study_plan_items for insert to authenticated with check (exists (select 1 from public.goals g where g.id=goal_id and g.student_id=(select auth.uid())));
create policy plan_items_own_update on public.study_plan_items for update to authenticated using (exists (select 1 from public.goals g where g.id=goal_id and g.student_id=(select auth.uid()))) with check (exists (select 1 from public.goals g where g.id=goal_id and g.student_id=(select auth.uid())));
create policy reflections_own_read on public.weekly_reflections for select to authenticated using (student_id=(select auth.uid()));
create policy reflections_own_insert on public.weekly_reflections for insert to authenticated with check (student_id=(select auth.uid()));
create policy reflections_own_update on public.weekly_reflections for update to authenticated using (student_id=(select auth.uid())) with check (student_id=(select auth.uid()));
create policy notifications_own_read on public.notifications for select to authenticated using (recipient_id=(select auth.uid()));
create policy notifications_own_update on public.notifications for update to authenticated using (recipient_id=(select auth.uid())) with check (recipient_id=(select auth.uid()));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = pg_catalog, public as $$ begin new.updated_at=now(); return new; end $$;
create trigger goals_touch_updated_at before update on public.goals for each row execute function public.touch_updated_at();
