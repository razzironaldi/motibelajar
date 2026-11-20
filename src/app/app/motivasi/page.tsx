import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";
import MotivationForm from "./motivation-form";

export default async function MotivationPage() {
  const supabase = await createClient();
  const { data: questions } = supabase
    ? await supabase
        .from("motivation_questions")
        .select("id,prompt,dimension,order_no,version_id")
        .order("order_no")
        .limit(32)
    : { data: [] };
  const versionId = questions?.[0]?.version_id ?? "";

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
        <p className="text-[13px] font-medium text-[#3d4128]">
          Motivasi belajar
        </p>
        <h1 className="font-editorial mt-3 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[58px]">
          Cek-in singkat, tanpa{" "}
          <EditorialHighlight>label.</EditorialHighlight>
        </h1>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
          Jawabanmu menghasilkan ringkasan deskriptif untuk refleksi diri. Ini
          bukan diagnosis, pemeringkatan, atau penentuan risiko.
        </p>
      </header>

      {questions?.length ? (
        <MotivationForm versionId={versionId} questions={questions} />
      ) : (
        <div className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] px-8 py-14 text-center">
          <Sparkles
            className="mx-auto h-6 w-6 text-[#3d4128]"
            strokeWidth={1.6}
          />
          <h2 className="font-editorial mt-4 text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
            Instrumen belum tersedia
          </h2>
          <p className="mt-2 text-[15px] text-[#0e0f0a]/65">
            Daftar pernyataan refleksi akan tampil di sini saat instrumen aktif.
          </p>
        </div>
      )}
    </PageFade>
  );
}
