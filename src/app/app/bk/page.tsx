import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RequestForm from "./request-form";

export default async function BkPage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: requests } = supabase && user ? await supabase.from("counseling_requests").select("id,category,urgency,status,created_at").eq("student_id", user.id).order("created_at", { ascending: false }).limit(20) : { data: [] };
  return <div className="subpage"><Link className="back-link" href="/app">← Ringkasan</Link><section className="subpage-heading"><p className="eyebrow"><span className="eyebrow-dot" /> Pendampingan BK</p><h1>Kamu tidak harus<br /><em>menyimpan semua.</em></h1><p>Ruang privat untuk meminta dukungan dari guru BK yang mendampingi kamu.</p></section><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><RequestForm /><section aria-labelledby="history-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 id="history-title" className="text-lg font-semibold text-slate-950">Riwayat permintaan</h2>{requests?.length ? <ul className="mt-4 space-y-3">{requests.map((request) => <li key={request.id} className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><span className="font-medium capitalize text-slate-900">{request.category}</span><span className="text-xs font-semibold uppercase text-indigo-700">{request.status}</span></div><p className="mt-1 text-sm text-slate-600">Prioritas {request.urgency}</p></li>)}</ul> : <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Belum ada permintaan konseling.</p>}</section></div></div>;
}
