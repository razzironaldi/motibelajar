begin;
\ir fixtures/roles.fixture
grant select (id,role,active) on public.profiles to authenticated;
grant select,insert,update on public.counseling_follow_ups to authenticated;
select plan(4);
insert into public.counseling_sessions(id,student_id,counselor_id) values ('80000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000011');
select public.test_as('10000000-0000-0000-0000-000000000011'::uuid); set local role authenticated;
select ok(public.create_counseling_follow_up('80000000-0000-0000-0000-000000000001'::uuid,'Kirim ringkasan',now()+interval '1 day','10000000-0000-0000-0000-000000000011'::uuid) is not null,'Primary BK creates follow-up');
select ok(public.update_counseling_follow_up((select id from public.counseling_follow_ups limit 1),'completed') is not null,'owner completes follow-up');
select public.test_as('10000000-0000-0000-0000-000000000006'::uuid);
select throws_ok($$select public.update_counseling_follow_up((select id from public.counseling_follow_ups limit 1),'closed')$$,'P0001','follow-up not authorized','Admin cannot update BK follow-up');
select public.test_as('10000000-0000-0000-0000-000000000002'::uuid);
select is((select count(*)::int from public.counseling_follow_ups),0,'Student B cannot read follow-up');
select * from finish(); rollback;
