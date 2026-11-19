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
  const { data: requestIdValue, error: createError } = await supabase.rpc("create_counseling_request", { p_category: category, p_urgency: urgency, p_reason: reason, p_availability_json: body?.availability ?? {} });
  if (createError) {
    console.error("counseling_request_create_failed", { requestId, code: createError.code, message: createError.message, details: createError.details, hint: createError.hint });
    return envelope(null, { code: createError.code === "23503" ? "no_assigned_counselor" : "create_failed" }, requestId, createError.code === "23503" ? 409 : 500);
  }
  const { data, error } = await supabase.from("counseling_requests").select("id,category,urgency,status,created_at").eq("id", requestIdValue).single();
  if (error) return envelope(null, { code: "create_readback_failed" }, requestId, 500);
  return envelope(data, null, requestId, 201);
}
