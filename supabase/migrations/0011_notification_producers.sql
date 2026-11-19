create or replace function public.enqueue_notification(p_recipient_id uuid, p_type text, p_entity_type text, p_entity_id uuid, p_summary text, p_key text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare notification_id uuid;
begin
  if p_recipient_id is null or p_summary is null or char_length(p_summary) > 240 then raise exception 'invalid notification'; end if;
  insert into public.notifications(recipient_id,type,entity_type,entity_id,safe_summary,idempotency_key)
  values(p_recipient_id,p_type,p_entity_type,p_entity_id,p_summary,p_key)
  on conflict (idempotency_key) do update set safe_summary=public.notifications.safe_summary
  returning public.notifications.id into notification_id;
  return notification_id;
end $$;
revoke all on function public.enqueue_notification(uuid,text,text,uuid,text,text) from public;
grant execute on function public.enqueue_notification(uuid,text,text,uuid,text,text) to authenticated;

create or replace function public.notify_counseling_request() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.enqueue_notification(new.assigned_counselor_id,'counseling_request','counseling_request',new.id,'Permintaan pendampingan baru', 'counseling-request:'||new.id::text);
  return new;
end $$;
create trigger counseling_request_notification after insert on public.counseling_requests for each row execute function public.notify_counseling_request();

create or replace function public.notify_counseling_appointment() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if new.status = 'offered' then perform public.enqueue_notification(new.student_id,'counseling_offer','counseling_appointment',new.id,'Jadwal pendampingan menunggu konfirmasi','counseling-offer:'||new.id::text); end if;
  return new;
end $$;
create trigger counseling_appointment_notification after insert or update of status on public.counseling_appointments for each row execute function public.notify_counseling_appointment();
