import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";
import JournalForm from "./journal-form";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: entries } = supabase
    ? await supabase
        .from("journal_entries")
        .select("id,title,body,visibility,updated_at")
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <PageFade className="space-y-10">
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-[14px] text-[#0e0f0a]/65 transition-colors hover:text-[#0e0f0a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Ringkasan
      </Link>

      <header className="max-w-2xl border-b border-[#0e0f0a]/12 pb-10">
        <p className="text-[13px] font-medium text-[#3d4128]">Jurnal belajar</p>
        <h1 className="font-editorial mt-3 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[58px]">
          Catat proses, bukan hanya{" "}
          <EditorialHighlight>hasil.</EditorialHighlight>
        </h1>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
          Jurnal tersimpan privat. Kamu dapat merevisi catatan kapan saja tanpa
          menghapus riwayat pertumbuhanmu.
        </p>
      </header>

      <JournalForm entries={entries ?? []} />
    </PageFade>
  );
}
