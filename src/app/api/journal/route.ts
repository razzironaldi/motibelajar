import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const reply = (data: unknown, error: unknown, requestId: string, status = 200) => NextResponse.json({ data, error, requestId }, { status });
export async function GET() {
  const requestId = crypto.randomUUID(); const supabase = await createClient();
  if (!supabase) return reply(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return reply(null, { code: "unauthenticated" }, requestId, 401);
  const { data, error } = await supabase.from("journal_entries").select("id,title,body,visibility,created_at,updated_at").order("updated_at", { ascending: false });
  return error ? reply(null, { code: "read_failed" }, requestId, 500) : reply(data ?? [], null, requestId);
}
export async function POST(request: Request) {
  const requestId = crypto.randomUUID(); const supabase = await createClient();
  if (!supabase) return reply(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return reply(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { title?: string; body?: string } | null;
  if (!body?.title?.trim() || !body.body?.trim() || body.title.length > 160 || body.body.length > 10000) return reply(null, { code: "invalid_input" }, requestId, 400);
  const { data, error } = await supabase.rpc("create_journal_entry", { p_title: body.title.trim(), p_body: body.body.trim() });
  return error ? reply(null, { code: "create_failed" }, requestId, 409) : reply({ id: data }, null, requestId, 201);
}
export async function PATCH(request: Request) {
  const requestId = crypto.randomUUID(); const supabase = await createClient();
  if (!supabase) return reply(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return reply(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { id?: string; title?: string; body?: string } | null;
  if (!body?.id || !body.title?.trim() || !body.body?.trim()) return reply(null, { code: "invalid_input" }, requestId, 400);
  const { data, error } = await supabase.rpc("revise_journal_entry", { p_entry_id: body.id, p_title: body.title.trim(), p_body: body.body.trim() });
  return error ? reply(null, { code: "update_failed" }, requestId, 409) : reply({ id: data }, null, requestId);
}
