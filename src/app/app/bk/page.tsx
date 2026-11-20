import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";
import RequestForm from "./request-form";
import Queue from "./queue";

export default async function BkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: role } = supabase
    ? await supabase.rpc("current_app_role")
    : { data: "student" };
  const isStudent = role === "student";

  const { data: requests } =
    supabase && user && isStudent
      ? await supabase
          .from("counseling_requests")
          .select("id,category,urgency,status,created_at")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)
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

      <section className="max-w-2xl border-b border-[#0e0f0a]/12 pb-10">
        <p className="text-[13px] font-medium text-[#3d4128]">
          {isStudent ? "Pendampingan BK" : "Antrean BK"}
        </p>
        <h1 className="font-editorial mt-3 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[58px]">
          {isStudent ? (
            <>
              Kamu tidak harus menyimpan{" "}
              <EditorialHighlight>semua.</EditorialHighlight>
            </>
          ) : (
            <>
              Dampingi dengan konteks yang{" "}
              <EditorialHighlight>tepat.</EditorialHighlight>
            </>
          )}
        </h1>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
          {isStudent
            ? "Ruang privat untuk meminta dukungan dari guru BK yang mendampingimu."
            : "Antrean terbatas pada siswa dengan assignment aktif."}
        </p>
      </section>

      {isStudent ? (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <RequestForm />
          </div>

          <section
            aria-labelledby="history-title"
            className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-8 lg:col-span-6"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#0e0f0a]/10 pb-5">
              <h2
                id="history-title"
                className="font-editorial text-[26px] tracking-[-0.03em] text-[#0e0f0a]"
              >
                Riwayat permintaan
              </h2>
              <span className="tabular-nums text-[13px] text-[#0e0f0a]/60">
                {requests?.length ?? 0} catatan
              </span>
            </div>

            {requests?.length ? (
              <ul className="mt-4 divide-y divide-[#0e0f0a]/10">
                {requests.map((request) => (
                  <li key={request.id} className="py-4 first:pt-2 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[15px] font-medium capitalize text-[#0e0f0a]">
                        {request.category}
                      </span>
                      <span className="text-[12px] font-medium text-[#3d4128] uppercase tracking-[0.04em]">
                        {request.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[#0e0f0a]/65">
                      Prioritas {request.urgency}
                      {request.created_at ? (
                        <>
                          {" · "}
                          {new Date(request.created_at).toLocaleDateString(
                            "id-ID",
                            { dateStyle: "medium" }
                          )}
                        </>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-[18px] bg-[#faf5f1] p-6 text-center">
                <Shield className="mx-auto h-5 w-5 text-[#3d4128]" strokeWidth={1.6} />
                <p className="mt-3 text-[14px] text-[#0e0f0a]/70">
                  Belum ada permintaan konseling.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <Queue />
      )}
    </PageFade>
  );
}
