begin;
\ir fixtures/roles.fixture
grant select (id,role,active) on public.profiles to authenticated;
select plan(5);
select public.test_as('10000000-0000-0000-0000-000000000001'::uuid); set local role authenticated;
select ok(public.create_journal_entry('Catatan A','Isi awal') is not null,'Student A creates journal');
select ok(public.revise_journal_entry((select id from public.journal_entries limit 1),'Catatan A revisi','Isi revisi') is not null,'Student A revises journal');
select is((select count(*)::int from public.journal_revisions),2,'revision history retained');
select public.test_as('10000000-0000-0000-0000-000000000002'::uuid);
select is((select count(*)::int from public.journal_entries),0,'Student B cannot read Student A journal');
select public.test_as('10000000-0000-0000-0000-000000000006'::uuid);
select is((select count(*)::int from public.journal_entries),0,'Admin cannot read private journal');
select * from finish(); rollback;
