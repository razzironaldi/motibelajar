begin;
select plan(5);
select has_table('public','journal_entries','journal table exists');
select has_table('public','journal_revisions','journal revision table exists');
select col_type_is('public','journal_entries','student_id','uuid','journal owned by student');
select col_type_is('public','journal_entries','visibility','text','visibility exists');
select ok(to_regprocedure('public.create_journal_entry(text,text)') is not null,'create journal helper exists');
select * from finish(); rollback;
