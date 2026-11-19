import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const reply = (data: unknown, error: unknown, requestId: string, status = 200) => NextResponse.json({ data, error, requestId }, { status });

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return reply(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return reply(null, { code: "unauthenticated" }, requestId, 401);
  const assignmentId = new URL(request.url).searchParams.get("assignmentId");
  if (!assignmentId) {
    const { data, error } = await supabase.from("lms_quiz_assignments").select("id,quiz_id,course_id,attempt_limit").eq("student_id", user.id).eq("status", "active");
    return error ? reply(null, { code: "read_failed" }, requestId, 403) : reply(data ?? [], null, requestId);
  }
  const { data, error } = await supabase.rpc("student_quiz_questions", { p_assignment_id: assignmentId });
  return error ? reply(null, { code: "read_failed" }, requestId, 403) : reply(data ?? [], null, requestId);
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return reply(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return reply(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { assignmentId?: string; answers?: unknown[] } | null;
  if (!body?.assignmentId || !Array.isArray(body.answers)) return reply(null, { code: "invalid_input" }, requestId, 400);
  const { data, error } = await supabase.rpc("submit_student_quiz", { p_assignment_id: body.assignmentId, p_student_id: user.id, p_answers: body.answers });
  return error ? reply(null, { code: "submit_failed" }, requestId, 409) : reply({ attemptId: data }, null, requestId, 201);
}
