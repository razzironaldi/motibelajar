begin;
select plan(5);
select has_table('public','lms_courses','course table exists');
select has_table('public','lms_lessons','lesson table exists');
select has_table('public','lms_enrollments','enrollment table exists');
select has_table('public','lms_progress','progress table exists');
select ok(to_regprocedure('public.mark_lesson_progress(uuid,uuid)') is not null,'progress helper exists');
select * from finish(); rollback;
