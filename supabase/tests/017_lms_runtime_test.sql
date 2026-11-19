begin;
\ir fixtures/roles.fixture
grant select (id,role,active) on public.profiles to authenticated;
select plan(5);
insert into public.lms_courses(id,title,status) values('90000000-0000-0000-0000-000000000001','Matematika Demo','published');
insert into public.lms_lessons(id,course_id,title,content,order_no) values('90000000-0000-0000-0000-000000000011','90000000-0000-0000-0000-000000000001','Bab 1','Isi',1);
insert into public.lms_enrollments(id,course_id,student_id) values('90000000-0000-0000-0000-000000000101','90000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001');
select public.test_as('10000000-0000-0000-0000-000000000001'::uuid); set local role authenticated;
select ok(public.mark_lesson_progress('90000000-0000-0000-0000-000000000011'::uuid,'10000000-0000-0000-0000-000000000001'::uuid) is not null,'Student A marks enrolled lesson');
select is((select count(*)::int from public.lms_progress),1,'progress stored');
select public.test_as('10000000-0000-0000-0000-000000000002'::uuid);
select is((select count(*)::int from public.lms_courses),0,'Student B cannot read unenrolled course');
select throws_ok($$select public.mark_lesson_progress('90000000-0000-0000-0000-000000000011'::uuid,'10000000-0000-0000-0000-000000000002'::uuid)$$,'P0001','lesson not available','Student B cannot mark Student A lesson');
select public.test_as('10000000-0000-0000-0000-000000000006'::uuid);
select is((select count(*)::int from public.lms_progress),0,'Admin cannot read student progress');
select * from finish(); rollback;
