-- Demo-only seed. Requires profiles linked to Supabase auth.users.
-- Run only in local/demo environments after creating dummy auth accounts.
insert into public.schools (id, name, timezone, active)
values ('00000000-0000-0000-0000-000000000001', 'MotiBelajar Demo School', 'Asia/Jakarta', true)
on conflict (id) do nothing;

insert into public.public_site_announcements (id, slug, title, body, published_at, schema_version, source_version, visible)
values ('00000000-0000-0000-0000-000000000101', 'welcome', 'Selamat datang di MotiBelajar', 'Ruang belajar dan pendampingan siswa.', now(), 1, 1, true)
on conflict (id) do nothing;
