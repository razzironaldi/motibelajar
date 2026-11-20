import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: role } = supabase
    ? await supabase.rpc("current_app_role")
    : { data: null };
  const result =
    role === "reviewer" && supabase
      ? await supabase.rpc("reviewer_assignments")
      : { data: null };
  const summary =
    role === "admin" && supabase
      ? await supabase.rpc("admin_workspace_summary")
      : { data: null };

  return (
    <PageFade className="space-y-10">
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-[14px] text-[#0e0f0a]/65 transition-colors hover:text-[#0e0f0a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Ringkasan
      </Link>

      <section className="max-w-2xl border-b border-[#0e0f0a]/12 pb-10">
        <p className="text-[13px] font-medium text-[#3d4128]">Ruang kerja</p>
        <h1 className="font-editorial mt-3 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[58px]">
          Operasi yang{" "}
          <EditorialHighlight>terarah.</EditorialHighlight>
        </h1>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
          Data operasional terbatas. Catatan privat, kunci jawaban, dan jurnal
          siswa tidak pernah ditampilkan di sini.
        </p>
      </section>

      {role === "admin" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(summary.data ?? []).map(
            (item: { metric: string; value: number }, idx: number) => (
              <article
                className={`rounded-[24px] p-7 ${
                  idx % 3 === 1
                    ? "bg-[#e5e1d6]"
                    : "border border-[#0e0f0a]/10 bg-[#fefffa]"
                }`}
                key={item.metric}
              >
                <p className="text-[12px] font-medium tracking-[0.04em] text-[#3d4128] uppercase">
                  {item.metric.replaceAll("_", " ")}
                </p>
                <p className="font-editorial tabular-nums mt-4 text-[46px] leading-none tracking-[-0.04em] text-[#0e0f0a]">
                  {item.value}
                </p>
              </article>
            )
          )}
        </div>
      ) : (
        <section className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-9">
          <h2 className="font-editorial text-[28px] tracking-[-0.03em] text-[#0e0f0a]">
            Tugas reviewer
          </h2>
          {(result.data ?? []).length ? (
            <ul className="mt-5 divide-y divide-[#0e0f0a]/10 border-t border-[#0e0f0a]/10">
              {result.data.map(
                (item: {
                  assignment_id: string;
                  assessment_name: string;
                  version_no: number;
                  permission: string;
                }) => (
                  <li
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                    key={item.assignment_id}
                  >
                    <p className="text-[15px] font-medium text-[#0e0f0a]">
                      {item.assessment_name} · v{item.version_no}
                    </p>
                    <p className="text-[13px] text-[#0e0f0a]/65">
                      Izin: {item.permission}
                    </p>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="mt-4 text-[15px] text-[#0e0f0a]/68">
              Belum ada tugas review.
            </p>
          )}
        </section>
      )}
    </PageFade>
  );
}
