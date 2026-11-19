begin;
select plan(1);
select ok(to_regprocedure('public.create_counseling_slot(uuid,timestamptz,timestamptz,text,text)') is not null,'slot creation helper exists');
select * from finish(); rollback;
