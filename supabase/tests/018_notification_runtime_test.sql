begin;
\ir fixtures/roles.fixture
select plan(4);
insert into public.counseling_requests(id,student_id,assigned_counselor_id,reason,category,urgency) values('91000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000011','Perlu bantuan','belajar','normal');
select is((select count(*)::int from public.notifications where idempotency_key='counseling-request:91000000-0000-0000-0000-000000000001'),1,'request creates counselor notification');
select is((select recipient_id from public.notifications where idempotency_key='counseling-request:91000000-0000-0000-0000-000000000001'),'10000000-0000-0000-0000-000000000011'::uuid,'notification recipient is assigned counselor');
select public.test_as('10000000-0000-0000-0000-000000000001'::uuid); set local role authenticated;
select throws_ok($$select public.enqueue_notification('10000000-0000-0000-0000-000000000001'::uuid,'x','x',null,null,'manual-test')$$,'P0001','invalid notification','notification validates summary/recipient');
select public.test_as('10000000-0000-0000-0000-000000000011'::uuid);
select is((select count(*)::int from public.notifications),1,'counselor sees own notification through RLS');
select * from finish(); rollback;