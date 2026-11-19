import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: [], error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { code: "unauthenticated" }, requestId }, { status: 401 });
  const { data, error } = await supabase.from("goals").select("id,title,description,target_metric,deadline,status,completed_at,created_at,study_plan_items(id,action,if_condition,then_action,due_at,status,completed_at)").eq("student_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ data: null, error: { code: "read_failed" }, requestId }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null, requestId });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: null, error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { code: "unauthenticated" }, requestId }, { status: 401 });
  const body = await request.json().catch(() => null) as { title?: string; targetMetric?: string; deadline?: string; description?: string } | null;
  const title = body?.title?.trim() ?? "";
  const targetMetric = body?.targetMetric?.trim() ?? "";
  const deadline = body?.deadline ?? "";
  if (title.length < 1 || title.length > 160 || targetMetric.length < 1 || targetMetric.length > 240 || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return NextResponse.json({ data: null, error: { code: "invalid_input" }, requestId }, { status: 400 });
  }
  const { data, error } = await supabase.from("goals").insert({ student_id: user.id, title, target_metric: targetMetric, deadline, description: body?.description?.trim().slice(0, 2000) ?? "" }).select("id,title,description,target_metric,deadline,status,completed_at,created_at").single();
  if (error) return NextResponse.json({ data: null, error: { code: "create_failed" }, requestId }, { status: 500 });
  return NextResponse.json({ data, error: null, requestId }, { status: 201 });
}
