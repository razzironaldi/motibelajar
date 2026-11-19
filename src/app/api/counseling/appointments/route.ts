import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const response = (data: unknown, error: unknown, requestId: string, status = 200) => NextResponse.json({ data, error, requestId }, { status });

export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return response(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return response(null, { code: "unauthenticated" }, requestId, 401);
  const { data, error } = await supabase.from("counseling_appointments").select("id,request_id,slot_id,student_id,counselor_id,status,confirmed_at,cancelled_at,created_at").or(`student_id.eq.${user.id},counselor_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(50);
  if (error) return response(null, { code: "read_failed" }, requestId, 500);
  return response(data ?? [], null, requestId);
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return response(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return response(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { action?: string; requestId?: string; slotId?: string; appointmentId?: string; newSlotId?: string; reason?: string } | null;
  if (!body?.action) return response(null, { code: "invalid_input" }, requestId, 400);
  const rpc = body.action === "offer" ? "offer_counseling_slot" : body.action === "confirm" ? "confirm_counseling_appointment" : body.action === "cancel" ? "cancel_counseling_appointment" : body.action === "reschedule" ? "reschedule_counseling_appointment" : null;
  if (!rpc) return response(null, { code: "unsupported_action" }, requestId, 400);
  const args = body.action === "offer" ? { p_request_id: body.requestId, p_slot_id: body.slotId, p_counselor_id: user.id } : body.action === "confirm" ? { p_appointment_id: body.appointmentId, p_student_id: user.id } : body.action === "cancel" ? { p_appointment_id: body.appointmentId, p_actor_id: user.id, p_reason: body.reason ?? "" } : { p_appointment_id: body.appointmentId, p_actor_id: user.id, p_new_slot_id: body.newSlotId };
  const { data, error } = await supabase.rpc(rpc, args);
  if (error) return response(null, { code: "transition_failed" }, requestId, 409);
  return response({ id: data }, null, requestId, 200);
}
