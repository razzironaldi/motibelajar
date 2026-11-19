begin;
select plan(5);
select ok(to_regprocedure('public.submit_assessment_attempt(uuid,uuid,jsonb)') is not null,'assessment submit helper exists');
select has_table('public','assessment_assignments','assignment table exists');
select has_table('public','assessment_attempts','attempt table exists');
select has_table('public','assessment_result_snapshots','result snapshot exists');
select ok(to_regprocedure('public.assessment_student_questions(uuid)') is not null,'student question helper exists');
select * from finish(); rollback;
