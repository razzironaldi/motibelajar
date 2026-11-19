import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


export async function GET() {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ data: [], error: { code: "not_configured" }, requestId }, { status: 503 });
  const { data, error } = await supabase
    .from("public_site_announcements")
    .select("id,slug,title,body,published_at,schema_version,source_version")
    .eq("visible", true)
    .order("published_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ data: [], error: { code: "public_read_failed" }, requestId }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null, requestId }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
