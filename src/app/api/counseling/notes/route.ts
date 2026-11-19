import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: null, error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { code: "unauthenticated" }, requestId }, { status: 401 });
  const body = await request.json().catch(() => null) as { action?: string; sessionId?: string; noteId?: string; body?: string } | null;
  const text = body?.body?.trim() ?? "";
  if (!text || text.length > 10000) return NextResponse.json({ data: null, error: { code: "invalid_input" }, requestId }, { status: 400 });
  const rpc = body?.action === "revise" ? "revise_counseling_note" : "create_counseling_note";
  const args = rpc === "revise_counseling_note" ? { p_note_id: body?.noteId, p_counselor_id: user.id, p_body: text } : { p_session_id: body?.sessionId, p_counselor_id: user.id, p_body: text };
  const { data, error } = await supabase.rpc(rpc, args);
  if (error) return NextResponse.json({ data: null, error: { code: "note_transition_failed" }, requestId }, { status: 409 });
  return NextResponse.json({ data: { id: data }, error: null, requestId }, { status: 201 });
}
