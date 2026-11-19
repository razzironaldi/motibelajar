import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: null, error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { code: "unauthenticated" }, requestId }, { status: 401 });
  const { data, error } = await supabase.from("counseling_slots").select("id,counselor_id,starts_at,ends_at,channel,location_ref,status").eq("counselor_id", user.id).order("starts_at").limit(50);
  if (error) return NextResponse.json({ data: null, error: { code: "read_failed" }, requestId }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null, requestId });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: null, error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { code: "unauthenticated" }, requestId }, { status: 401 });
  const body = await request.json().catch(() => null) as { startsAt?: string; endsAt?: string; channel?: string; locationRef?: string } | null;
  if (!body?.startsAt || !body.endsAt || !["onsite", "online"].includes(body.channel ?? "")) return NextResponse.json({ data: null, error: { code: "invalid_input" }, requestId }, { status: 400 });
  const { data, error } = await supabase.rpc("create_counseling_slot", { p_counselor_id: user.id, p_starts_at: body.startsAt, p_ends_at: body.endsAt, p_channel: body.channel, p_location_ref: body.locationRef ?? "" });
  if (error) return NextResponse.json({ data: null, error: { code: "slot_create_failed" }, requestId }, { status: 409 });
  return NextResponse.json({ data: { id: data }, error: null, requestId }, { status: 201 });
}
