import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";

export default async function CoursesEmbed() {
  const supabase = await createClient();
  const { data } = supabase
    ? await supabase
        .from("public_site_courses")
        .select("id,slug,title,summary,published_at")
        .eq("visible", true)
        .order("published_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <main className="min-h-screen bg-[#faf5f1] text-[#0e0f0a]">
      <header className="border-b border-[#0e0f0a]/10">
        <div className="mx-auto flex max-w-[920px] items-center justify-between gap-6 px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="font-editorial text-[22px] tracking-[-0.02em] text-[#0e0f0a]"
          >
            MotiBelajar
          </Link>
          <div className="flex items-center gap-6 text-[14px]">
            <Link
              href="/embed/announcements"
              className="text-[#0e0f0a]/70 transition-colors hover:text-[#0e0f0a] whitespace-nowrap"
            >
              Pengumuman
            </Link>
            <Link
              href="/login"
              className="rounded-[10px] border border-[#0e0f0a]/25 px-4 py-2 font-medium text-[#0e0f0a] transition-colors hover:bg-[#e5e1d6] whitespace-nowrap"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <PageFade className="mx-auto max-w-[920px] px-6 py-16 sm:px-10 sm:py-20">
        <p className="text-[13px] font-medium text-[#3d4128]">
          Proyeksi publik MotiBelajar
        </p>
        <h1 className="font-editorial mt-3 text-[48px] leading-[0.92] tracking-[-0.048em] text-[#0e0f0a] sm:text-[64px]">
          Ruang belajar{" "}
          <EditorialHighlight>terbuka.</EditorialHighlight>
        </h1>

        {data?.length ? (
          <div className="mt-14 divide-y divide-[#0e0f0a]/12 border-y border-[#0e0f0a]/12">
            {data.map((item) => (
              <article className="py-8" key={item.id}>
                <h2 className="font-editorial text-[30px] leading-tight tracking-[-0.03em] text-[#0e0f0a]">
                  {item.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-[#0e0f0a]/76">
                  {item.summary}
                </p>
                <div className="mt-5">
                  <Link
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#3d4128] underline decoration-[#e1f079] decoration-2 underline-offset-4 transition-colors hover:text-[#de7653]"
                    href="/login"
                  >
                    Masuk untuk mulai belajar
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] px-8 py-14 text-center">
            <h2 className="font-editorial text-[28px] tracking-[-0.03em] text-[#0e0f0a]">
              Belum ada kursus publik
            </h2>
            <p className="mt-2 text-[15px] text-[#0e0f0a]/65">
              Kursus yang sudah diterbitkan akan tampil di sini.
            </p>
          </div>
        )}

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#0e0f0a]/60">
          <span>Konten publik MotiBelajar</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-[#0e0f0a] hover:text-[#de7653]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke beranda
          </Link>
        </footer>
      </PageFade>
    </main>
  );
}
