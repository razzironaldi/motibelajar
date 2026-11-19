import { createClient } from "@/lib/supabase/server";
import MotivationForm from "./motivation-form";

export default async function MotivationPage() {
  const supabase = await createClient();
  const { data: questions } = supabase ? await supabase.from("motivation_questions").select("id,prompt,dimension,order_no,version_id").order("order_no").limit(32) : { data: [] };
  const versionId = questions?.[0]?.version_id ?? "";
  return <main className="space-y-6"><header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Motivasi belajar</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Cek-in singkat, tanpa label.</h1><p className="mt-2 max-w-2xl text-slate-600">Jawabanmu menghasilkan ringkasan deskriptif untuk refleksi. Ini bukan diagnosis, ranking, atau penentuan risiko.</p></header>{questions?.length ? <MotivationForm versionId={versionId} questions={questions} /> : <p className="rounded-3xl bg-white p-6 text-slate-600">Instrumen belum tersedia.</p>}</main>;
}
