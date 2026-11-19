begin;
\ir fixtures/roles.fixture

-- Direct SQL tests need table privileges; RLS remains the authorization boundary.
grant select on public.profiles, public.counseling_notes, public.assessment_answer_keys, public.quiz_answer_keys, public.assessment_result_snapshots to anon, authenticated;
grant select on public.public_site_announcements to anon;
insert into public.public_site_announcements (id, slug, title, body, published_at, visible)
values ('40000000-0000-0000-0000-000000000001', 'test-welcome', 'Test', 'Test', now(), true);
select plan(11);

-- Anonymous sees only the public projection and cannot see private profiles.
set local role anon;
select is((select count(*)::int from public.public_site_announcements), 1, 'anon can read public announcement projection');
select is((select count(*)::int from public.profiles), 0, 'anon cannot read profiles');
select is((select count(*)::int from public.counseling_notes), 0, 'anon cannot read counseling notes');

-- Student A sees only own profile and no protected domain data.
reset role;
select public.test_as('10000000-0000-0000-0000-000000000001'::uuid);
set local role authenticated;
select is((select count(*)::int from public.profiles), 1, 'Student A reads own profile');
select is((select count(*)::int from public.profiles where id='10000000-0000-0000-0000-000000000002'), 0, 'Student A cannot read Student B profile');
select is((select count(*)::int from public.counseling_notes), 0, 'Student A cannot read counseling notes');
select is((select count(*)::int from public.assessment_answer_keys), 0, 'Student A cannot read assessment answer keys');
select is((select count(*)::int from public.quiz_answer_keys), 0, 'Student A cannot read quiz answer keys');

-- BK B is not assigned and must not receive private tables.
reset role;
select public.test_as('10000000-0000-0000-0000-000000000012'::uuid);
set local role authenticated;
select is((select count(*)::int from public.counseling_notes), 0, 'unassigned BK B cannot read counseling notes');
select is((select count(*)::int from public.assessment_result_snapshots), 0, 'unassigned BK B cannot read result snapshots');

-- Additional BK has an explicit permission, but counseling notes remain deny-by-default until policy is implemented.
reset role;
select public.test_as('10000000-0000-0000-0000-000000000013'::uuid);
set local role authenticated;
select is((select count(*)::int from public.counseling_notes), 0, 'additional BK remains denied before sharing policy implementation');

select * from finish();
rollback;
