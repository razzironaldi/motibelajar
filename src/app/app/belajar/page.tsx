import Link from "next/link";
import { ArrowLeft, Calendar, Target } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";
import GoalForm from "./goal-form";

export default async function BelajarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: goals } =
    user && supabase
      ? await supabase
          .from("goals")
          .select(
            "id,title,target_metric,deadline,status,study_plan_items(id,action,status)"
          )
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
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

      <section className="flex flex-col items-start justify-between gap-6 border-b border-[#0e0f0a]/12 pb-10 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <p className="text-[13px] font-medium text-[#3d4128]">Ruang belajar</p>
          <h1 className="font-editorial mt-3 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[58px]">
            Belajar sesuai{" "}
            <EditorialHighlight>ritmemu.</EditorialHighlight>
          </h1>
          <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
            Tetapkan arah kecil, ukur langkahnya, dan kembali lagi saat kamu
            siap melanjutkannya.
          </p>
        </div>
      </section>

      <div>
        <GoalForm />
      </div>

      {goals?.length ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const items = goal.study_plan_items ?? [];
            const completed = items.filter(
              (item) => item.status === "completed"
            ).length;
            const ratio = items.length > 0 ? (completed / items.length) * 100 : 0;

            return (
              <article
                key={goal.id}
                className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#0e0f0a]/60">
                      <span className="font-medium text-[#3d4128]">
                        {goal.status === "active" ? "Aktif" : "Selesai"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <time dateTime={goal.deadline}>
                          {new Date(goal.deadline).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}
                        </time>
                      </span>
                    </div>
                    <h2 className="font-editorial mt-2.5 text-[28px] leading-[1.08] tracking-[-0.03em] text-[#0e0f0a]">
                      {goal.title}
                    </h2>
                    <p className="mt-2 text-[15px] leading-[1.5] text-[#0e0f0a]/72">
                      {goal.target_metric}
                    </p>
                  </div>

                  <div className="min-w-[160px] text-left sm:text-right">
                    <p className="tabular-nums text-[14px] font-medium text-[#0e0f0a]">
                      {items.length
                        ? `${completed}/${items.length} langkah selesai`
                        : "Belum ada langkah"}
                    </p>
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#e5e1d6]">
                      <div
                        className="h-full rounded-full bg-[#3d4128] transition-all duration-300"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] px-8 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#faf5f1] text-[#3d4128]">
            <Target className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <h2 className="font-editorial mt-4 text-[28px] tracking-[-0.03em] text-[#0e0f0a]">
            Belum ada tujuan
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] text-[#0e0f0a]/68">
            Mulai dengan satu tujuan belajar yang dapat kamu ukur minggu ini.
          </p>
        </div>
      )}
    </PageFade>
  );
}
