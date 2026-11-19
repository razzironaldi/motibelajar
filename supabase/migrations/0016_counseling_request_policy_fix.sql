-- Avoid direct profiles reads inside request RLS; column grants intentionally exclude role.
drop policy if exists counseling_requests_assigned_bk_read on public.counseling_requests;
create policy counseling_requests_assigned_bk_read on public.counseling_requests
for select to authenticated
using (
  assigned_counselor_id=(select auth.uid())
  and public.current_app_role()='bk_teacher'
);

-- The request creator is actor-bound; the RPC performs assignment validation.
drop policy if exists counseling_requests_student_insert on public.counseling_requests;
create policy counseling_requests_student_insert on public.counseling_requests
for insert to authenticated
with check (student_id=(select auth.uid()));
