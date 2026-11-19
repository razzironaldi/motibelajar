import { createClient } from "@/lib/supabase/server";
import JournalForm from "./journal-form";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: entries } = supabase ? await supabase.from("journal_entries").select("id,title,body,visibility,updated_at").order("updated_at", { ascending: false }) : { data: [] };
  return <main className="space-y-6"><header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Jurnal belajar</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Catat proses, bukan hanya hasil.</h1><p className="mt-2 text-slate-600">Jurnal tersimpan privat. Kamu dapat merevisi tanpa menghapus riwayat.</p></header><JournalForm entries={entries ?? []} /></main>;
}
