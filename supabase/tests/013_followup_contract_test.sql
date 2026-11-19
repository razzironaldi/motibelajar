begin;
select plan(4);
select has_table('public','counseling_follow_ups','follow-up table exists');
select col_type_is('public','counseling_follow_ups','owner_id','uuid','follow-up owner exists');
select ok(to_regprocedure('public.create_counseling_follow_up(uuid,text,timestamptz,uuid)') is not null,'create follow-up helper exists');
select ok(to_regprocedure('public.update_counseling_follow_up(uuid,text)') is not null,'update follow-up helper exists');
select * from finish(); rollback;
