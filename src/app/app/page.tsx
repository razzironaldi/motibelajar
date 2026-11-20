import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade, ScoreCircle } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: goals } =
    user && supabase
      ? await supabase
          .from("goals")
          .select("id,title,status,deadline")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] };

  const totalGoals = goals?.length ?? 0;
  const activeGoals =
    goals?.filter((goal) => goal.status === "active").length ?? 0;
  const completedGoals =
    goals?.filter((goal) => goal.status !== "active").length ?? 0;
  const completionPct =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <PageFade className="space-y-12">
      {/* Editorial Welcome Header */}
      <section className="max-w-2xl">
        <p className="text-[13px] font-medium text-[#3d4128]">Ruang pribadimu</p>
        <h1 className="font-editorial mt-3 text-[48px] leading-[0.92] tracking-[-0.048em] text-[#0e0f0a] sm:text-[64px]">
          Mulai dari yang{" "}
          <EditorialHighlight>kecil.</EditorialHighlight>
        </h1>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
          Satu langkah hari ini cukup untuk menjaga arah belajarmu tetap
          terlihat.
        </p>
      </section>

      {/* Kindsight Tonal Stat Grid */}
      <section
        aria-label="Ringkasan progres"
        className="grid gap-5 sm:grid-cols-3"
      >
        <article className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7">
          <p className="text-[12px] font-medium text-[#0e0f0a]/55">
            Tujuan aktif
          </p>
          <p className="font-editorial tabular-nums mt-4 text-[48px] leading-none tracking-[-0.04em] text-[#0e0f0a]">
            {activeGoals}
          </p>
          <p className="mt-3 text-[13px] text-[#0e0f0a]/65">
            Sedang kamu kerjakan saat ini
          </p>
        </article>

        <article className="rounded-[24px] bg-[#e5e1d6] p-7">
          <p className="text-[12px] font-medium text-[#0e0f0a]/60">
            Tujuan tersimpan
          </p>
          <p className="font-editorial tabular-nums mt-4 text-[48px] leading-none tracking-[-0.04em] text-[#0e0f0a]">
            {totalGoals}
          </p>
          <p className="mt-3 text-[13px] text-[#0e0f0a]/68">
            Riwayat arah belajarmu
          </p>
        </article>

        <article className="rounded-[24px] bg-[#3d4128] p-7 text-[#faf5f1]">
          <p className="text-[12px] font-medium text-[#e1f079]">
            Pendampingan BK
          </p>
          <p className="font-editorial tabular-nums mt-4 text-[44px] leading-none tracking-[-0.04em] text-[#faf5f1]">
            Privat
          </p>
          <p className="mt-3 text-[13px] text-[#faf5f1]/72">
            Terhubung dengan guru BK pendampingmu
          </p>
        </article>
      </section>

      {/* Primary Feature Split */}
      <section className="grid gap-6 lg:grid-cols-12">
        <article className="flex flex-col justify-between gap-8 rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-8 sm:flex-row sm:items-center lg:col-span-7">
          <div className="max-w-md">
            <p className="text-[12px] font-medium tracking-[0.06em] text-[#3d4128] uppercase">
              Tujuan belajar
            </p>
            <h2 className="font-editorial mt-3 text-[32px] leading-[1.02] tracking-[-0.035em] text-[#0e0f0a]">
              {goals?.[0] ? (
                goals[0].title
              ) : (
                <>
                  Belum ada tujuan
                  <br />
                  yang dimulai.
                </>
              )}
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-[#0e0f0a]/70">
              {goals?.[0]
                ? `Target selesai ${new Date(goals[0].deadline).toLocaleDateString("id-ID", { dateStyle: "medium" })}.`
                : "Tulis satu tujuan belajar yang ingin kamu capai minggu ini."}
            </p>
            <div className="mt-6">
              <Link href="/app/belajar" className="mb-btn-primary">
                Kelola tujuan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="shrink-0">
            <ScoreCircle
              value={completionPct}
              label="Persentase tujuan selesai"
              size={118}
            />
          </div>
        </article>

        <article className="flex flex-col justify-between rounded-[24px] bg-[#3d4128] p-8 text-[#faf5f1] lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium tracking-[0.06em] text-[#e1f079] uppercase">
                Pendampingan BK
              </p>
              <HeartHandshake className="h-5 w-5 text-[#e1f079]" strokeWidth={1.6} />
            </div>
            <h2 className="font-editorial mt-4 text-[34px] leading-[1.02] tracking-[-0.035em] text-[#faf5f1]">
              Butuh tempat{" "}
              <EditorialHighlight variant="dark">bercerita?</EditorialHighlight>
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-[#faf5f1]/78">
              Ajukan permintaan sesi privat bersama guru BK yang mendampingi
              kamu.
            </p>
          </div>

          <div className="mt-8">
            <Link href="/app/bk" className="mb-btn-chartreuse">
              Buka pendampingan
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>

      {/* Quick Editorial Shortcuts */}
      <section aria-label="Pintasan ruang belajar" className="border-t border-[#0e0f0a]/12 pt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/app/motivasi",
              title: "Refleksi motivasi",
              desc: "Cek-in singkat deskriptif tanpa label.",
              icon: Sparkles,
            },
            {
              href: "/app/jurnal",
              title: "Jurnal belajar",
              desc: "Catat proses dan revisi kapan saja.",
              icon: BookMarked,
            },
            {
              href: "/app/kursus",
              title: "Kursus & kuis",
              desc: "Lanjutkan materi sesuai ritmemu.",
              icon: BookOpen,
            },
          ].map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="group flex items-start justify-between gap-4 rounded-[20px] border border-[#0e0f0a]/10 bg-[#fefffa] p-6 transition-colors hover:border-[#0e0f0a]/30"
              >
                <div>
                  <Icon
                    className="h-5 w-5 text-[#3d4128]"
                    strokeWidth={1.65}
                  />
                  <h3 className="font-editorial mt-3 text-[22px] leading-tight tracking-[-0.025em] text-[#0e0f0a]">
                    {shortcut.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-[1.45] text-[#0e0f0a]/65">
                    {shortcut.desc}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#0e0f0a]/45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0e0f0a]" />
              </Link>
            );
          })}
        </div>
      </section>
    </PageFade>
  );
}
