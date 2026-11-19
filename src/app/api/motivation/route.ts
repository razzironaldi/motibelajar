import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const out = (data: unknown, error: unknown, requestId: string, status = 200) => NextResponse.json({ data, error, requestId }, { status });

export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return out(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return out(null, { code: "unauthenticated" }, requestId, 401);
  const [questions, attempts] = await Promise.all([
    supabase.from("motivation_questions").select("id,prompt,dimension,order_no,version_id").order("order_no").limit(32),
    supabase.from("motivation_attempts").select("id,version_id,status,submitted_at").eq("student_id", user.id).order("submitted_at", { ascending: false }).limit(10),
  ]);
  if (questions.error || attempts.error) return out(null, { code: "read_failed" }, requestId, 500);
  return out({ questions: questions.data ?? [], attempts: attempts.data ?? [] }, null, requestId);
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return out(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return out(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { versionId?: string; answers?: { questionId?: string; value?: number }[] } | null;
  if (!body?.versionId || !Array.isArray(body.answers) || body.answers.length < 1 || body.answers.some((answer) => !answer.questionId || !Number.isInteger(answer.value) || (answer.value ?? 0) < 1 || (answer.value ?? 0) > 4)) return out(null, { code: "invalid_input" }, requestId, 400);
  const answers = body.answers;
  const { data, error } = await supabase.rpc("submit_motivation_answers", { p_version_id: body.versionId, p_student_id: user.id, p_answers: answers });
  if (error) return out(null, { code: "submit_failed" }, requestId, 409);
  return out(data, null, requestId, 201);
}
