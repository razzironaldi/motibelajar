import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: null, error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { code: "unauthenticated" }, requestId }, { status: 401 });
  const { data, error } = await supabase.from("counseling_requests").select("id,student_id,category,urgency,status,created_at").eq("assigned_counselor_id", user.id).in("status", ["submitted", "reviewed", "slot_offered"]).order("created_at", { ascending: true }).limit(50);
  if (error) return NextResponse.json({ data: null, error: { code: "read_failed" }, requestId }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null, requestId });
}
