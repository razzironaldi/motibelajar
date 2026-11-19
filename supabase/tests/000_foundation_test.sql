begin;
create extension if not exists pgtap;
select plan(18);

select has_schema('public', 'public schema exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'counselor_assignments', 'counselor assignments table exists');
select has_table('public', 'counseling_sessions', 'counseling sessions table exists');
select has_table('public', 'assessment_result_snapshots', 'protected result snapshots table exists');
select has_table('public', 'quiz_answer_keys', 'protected quiz answer keys table exists');

select col_is_pk('public', 'profiles', 'id', 'profiles primary key');
select col_is_pk('public', 'counselor_assignments', 'id', 'assignment id primary key');
select fk_ok('public', 'profiles', 'school_id', 'public', 'schools', 'id', 'profiles school FK');
select fk_ok('public', 'public_site_lessons', 'course_id', 'public', 'public_site_courses', 'id', 'public lesson course FK');
select fk_ok('public', 'counseling_notes', 'session_id', 'public', 'counseling_sessions', 'id', 'counseling note session FK');

select ok(to_regclass('public.one_active_primary_bk_per_student') is not null, 'active primary BK unique index');
select ok(to_regprocedure('public.is_primary_bk(uuid)') is not null, 'primary BK helper exists');
select ok(to_regprocedure('public.validate_assessment_attempt_integrity()') is not null, 'assessment attempt trigger helper exists');
select ok(to_regprocedure('public.validate_file_publication_integrity()') is not null, 'file publication helper exists');

select policies_are('public', 'public_site_announcements', array['public_announcements_read'], 'announcement projection policy');
select policies_are('public', 'public_site_aggregates', array['public_aggregates_read'], 'aggregate projection policy');
select policies_are('public', 'counseling_notes', array['counseling_notes_deny_all'], 'counseling notes explicit deny policy');

select * from finish();
rollback;
