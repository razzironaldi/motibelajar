import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const reply = (data: unknown, error: unknown, requestId: string, status = 200) => NextResponse.json({ data, error, requestId }, { status });

export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return reply(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return reply(null, { code: "unauthenticated" }, requestId, 401);
  const { data: role } = await supabase.rpc("current_app_role");
  if (role === "reviewer") {
    const { data, error } = await supabase.rpc("reviewer_assignments");
    return error ? reply(null, { code: "read_failed" }, requestId, 403) : reply({ role, assignments: data ?? [] }, null, requestId);
  }
  if (role === "admin") {
    const { data, error } = await supabase.rpc("admin_workspace_summary");
    return error ? reply(null, { code: "read_failed" }, requestId, 403) : reply({ role, summary: data ?? [] }, null, requestId);
  }
  return reply(null, { code: "not_authorized" }, requestId, 403);
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return reply(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return reply(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { assignmentId?: string; decision?: string; comment?: string } | null;
  if (!body?.assignmentId || !body.decision) return reply(null, { code: "invalid_input" }, requestId, 400);
  const { data, error } = await supabase.rpc("decide_assessment_review", { p_assignment_id: body.assignmentId, p_decision: body.decision, p_comment: body.comment ?? "" });
  return error ? reply(null, { code: "decision_failed" }, requestId, 409) : reply({ approvalId: data }, null, requestId, 201);
}
