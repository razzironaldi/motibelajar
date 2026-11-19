begin;
\ir fixtures/roles.fixture
grant select on public.counseling_requests, public.counseling_slots, public.counseling_appointments to authenticated;
select plan(3);
insert into public.counseling_requests (id, student_id, assigned_counselor_id, reason, category) values ('60000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000011','Booking test','belajar');
insert into public.counseling_slots (id, counselor_id, starts_at, ends_at, channel) values ('60000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000011',now()+interval '2 day',now()+interval '2 day 30 minutes','online');
insert into public.counseling_requests (id, student_id, assigned_counselor_id, reason, category) values ('60000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000011','Second booking test','belajar');
select public.test_as('10000000-0000-0000-0000-000000000011'::uuid); set local role authenticated;
select ok(public.offer_counseling_slot('60000000-0000-0000-0000-000000000001'::uuid,'60000000-0000-0000-0000-000000000011'::uuid,'10000000-0000-0000-0000-000000000011'::uuid) is not null,'first booking reserves slot');
select throws_ok($$select public.offer_counseling_slot('60000000-0000-0000-0000-000000000002'::uuid,'60000000-0000-0000-0000-000000000011'::uuid,'10000000-0000-0000-0000-000000000011'::uuid)$$,'P0001','slot unavailable','second booking rejected transactionally');
select is((select count(*)::int from public.counseling_appointments where slot_id='60000000-0000-0000-0000-000000000011'),1,'slot has one appointment');
select * from finish(); rollback;
