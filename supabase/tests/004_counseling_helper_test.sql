begin;
select plan(1);
select ok(to_regprocedure('public.current_primary_bk(uuid)') is not null, 'primary BK lookup helper exists');
select * from finish();
rollback;
