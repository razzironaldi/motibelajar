begin;
\ir fixtures/roles.fixture
-- Test-only minimum columns; production grants remain restrictive.
grant select (id, role, active) on public.profiles to authenticated;
grant select on public.counseling_requests, public.counseling_slots, public.counseling_appointments, public.counseling_notes, public.counselor_assignments to authenticated;
select plan(8);

-- Disposable counseling objects. Inserted by test owner, consumed through authenticated RLS/RPC.
insert into public.counseling_requests (id, student_id, assigned_counselor_id, reason, category)
values ('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000011','Need study support','belajar');
insert into public.counseling_slots (id, counselor_id, starts_at, ends_at, channel)
values ('50000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000011',now()+interval '1 day',now()+interval '1 day 30 minutes','online');

select public.test_as('10000000-0000-0000-0000-000000000011'::uuid);
set local role authenticated;
select ok(public.offer_counseling_slot('50000000-0000-0000-0000-000000000001'::uuid,'50000000-0000-0000-0000-000000000011'::uuid,'10000000-0000-0000-0000-000000000011'::uuid) is not null,'Primary BK can offer assigned slot');
select is((select status from public.counseling_requests where id='50000000-0000-0000-0000-000000000001'), 'slot_offered','offer updates request state');
select is((select status from public.counseling_slots where id='50000000-0000-0000-0000-000000000011'), 'offered','offer reserves slot');
select public.test_as('10000000-0000-0000-0000-000000000001'::uuid);
select ok(public.confirm_counseling_appointment((select id from public.counseling_appointments limit 1),'10000000-0000-0000-0000-000000000001'::uuid) is not null,'Student A can confirm own offer');
select is((select status from public.counseling_appointments limit 1), 'confirmed','confirmation updates appointment');
select public.test_as('10000000-0000-0000-0000-000000000002'::uuid);
select is((select count(*)::int from public.counseling_appointments),0,'Student B cannot read Student A appointment');
select public.test_as('10000000-0000-0000-0000-000000000021'::uuid);
select is((select count(*)::int from public.counseling_notes),0,'Admin cannot read private notes');
select public.test_as('10000000-0000-0000-0000-000000000012'::uuid);
select throws_ok($$select public.offer_counseling_slot('50000000-0000-0000-0000-000000000001'::uuid,'50000000-0000-0000-0000-000000000011'::uuid,'10000000-0000-0000-0000-000000000012'::uuid)$$,'P0001','request not authorized','BK B cannot offer A request');
select * from finish();
rollback;
