import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: null, error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { code: "unauthenticated" }, requestId }, { status: 401 });
  const body = await request.json().catch(() => null) as { action?: string; sessionId?: string; body?: string } | null;
  const rpc = body?.action === "revoke" ? "revoke_counseling_summary" : "publish_counseling_summary";
  const args = rpc === "revoke_counseling_summary" ? { p_session_id: body?.sessionId, p_actor_id: user.id } : { p_session_id: body?.sessionId, p_actor_id: user.id, p_body: body?.body?.trim() ?? "" };
  if (rpc === "publish_counseling_summary" && (!args.p_body || args.p_body.length > 2000)) return NextResponse.json({ data: null, error: { code: "invalid_input" }, requestId }, { status: 400 });
  const { data, error } = await supabase.rpc(rpc, args);
  if (error) return NextResponse.json({ data: null, error: { code: "summary_transition_failed" }, requestId }, { status: 409 });
  return NextResponse.json({ data: { id: data }, error: null, requestId }, { status: 201 });
}
