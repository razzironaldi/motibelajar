import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function envelope(data: unknown, error: unknown, requestId: string, status = 200) {
  return NextResponse.json({ data, error, requestId }, { status });
}

export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return envelope(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return envelope(null, { code: "unauthenticated" }, requestId, 401);
  const { data, error } = await supabase.from("counseling_requests").select("id,category,urgency,status,created_at,updated_at").eq("student_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error) return envelope(null, { code: "read_failed" }, requestId, 500);
  return envelope(data ?? [], null, requestId);
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return envelope(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return envelope(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { reason?: string; category?: string; urgency?: string; availability?: unknown } | null;
  const reason = body?.reason?.trim() ?? "";
  const category = body?.category ?? "";
  const categories = ["belajar", "pribadi", "sosial", "karier", "lainnya"];
  const urgency = body?.urgency === "segera" ? "segera" : "normal";
  if (reason.length < 1 || reason.length > 2000 || !categories.includes(category)) return envelope(null, { code: "invalid_input" }, requestId, 400);
  const { data: counselorId, error: counselorError } = await supabase.rpc("current_primary_bk", { p_student_id: user.id });
  if (counselorError) {
    console.error("counseling_request_primary_bk_failed", { requestId, code: counselorError.code, message: counselorError.message, details: counselorError.details, hint: counselorError.hint });
    return envelope(null, { code: "counselor_lookup_failed" }, requestId, 500);
  }
  if (!counselorId) return envelope(null, { code: "no_assigned_counselor" }, requestId, 409);
  const { data, error } = await supabase.from("counseling_requests").insert({ student_id: user.id, assigned_counselor_id: counselorId, reason, category, urgency, availability_json: body?.availability ?? {} }).select("id,category,urgency,status,created_at").single();
  if (error) return envelope(null, { code: "create_failed" }, requestId, 500);
  return envelope(data, null, requestId, 201);
}
