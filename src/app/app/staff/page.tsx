import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: role } = supabase ? await supabase.rpc("current_app_role") : { data: null };
  const result = role === "reviewer" && supabase ? await supabase.rpc("reviewer_assignments") : { data: null };
  const summary = role === "admin" && supabase ? await supabase.rpc("admin_workspace_summary") : { data: null };
  return <div className="subpage"><Link className="back-link" href="/app">← Ringkasan</Link><section className="subpage-heading"><p className="eyebrow"><span className="eyebrow-dot" /> Ruang kerja</p><h1>Operasi yang<br /><em>terarah.</em></h1><p>Data operasional terbatas. Catatan privat, kunci jawaban, dan jurnal siswa tidak ditampilkan.</p></section>{role === "admin" ? <div className="grid gap-4 sm:grid-cols-2">{(summary.data ?? []).map((item: { metric: string; value: number }) => <article className="workspace-panel p-5" key={item.metric}><p className="panel-kicker">{item.metric.replaceAll("_", " ")}</p><p className="mt-2 text-3xl font-semibold">{item.value}</p></article>)}</div> : <section className="workspace-panel p-6"><h2 className="text-xl font-semibold">Tugas reviewer</h2>{(result.data ?? []).length ? <ul className="mt-4 space-y-3">{result.data.map((item: { assignment_id: string; assessment_name: string; version_no: number; permission: string }) => <li className="rounded-2xl bg-slate-50 p-4" key={item.assignment_id}><p className="font-medium">{item.assessment_name} · v{item.version_no}</p><p className="text-sm text-slate-600">Izin: {item.permission}</p></li>)}</ul> : <p className="mt-3 text-slate-600">Belum ada tugas review.</p>}</section>}</div>;
}
