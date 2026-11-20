import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";
import AssessmentForm from "./assessment-form";

export default async function AssessmentPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: assignments } =
    user && supabase
      ? await supabase
          .from("assessment_assignments")
          .select(
            "id,opens_at,closes_at,attempt_limit,assessment_versions(assessment_id,version_no,assessments(name,purpose))"
          )
          .eq("student_id", user.id)
          .order("opens_at", { ascending: false })
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
        <p className="text-[13px] font-medium text-[#3d4128]">Cek pemahaman</p>
        <h1 className="font-editorial mt-3 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[58px]">
          Jawab dengan{" "}
          <EditorialHighlight>tenang.</EditorialHighlight>
        </h1>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
          Assessment terbatas pada tugas yang ditujukan untukmu. Kunci jawaban
          dan perhitungan tetap privat.
        </p>
      </section>

      {assignments?.length ? (
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const version = Array.isArray(assignment.assessment_versions)
              ? assignment.assessment_versions[0]
              : assignment.assessment_versions;
            const assessment =
              version &&
              (Array.isArray(version.assessments)
                ? version.assessments[0]
                : version.assessments);

            return (
              <article
                className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-9"
                key={assignment.id}
              >
                <p className="text-[12px] font-medium tracking-[0.06em] text-[#3d4128] uppercase">
                  Assessment
                </p>
                <h2 className="font-editorial mt-2 text-[30px] leading-tight tracking-[-0.03em] text-[#0e0f0a]">
                  {assessment?.name ?? "Assessment belajar"}
                </h2>
                <p className="mt-2 text-[15px] leading-[1.55] text-[#0e0f0a]/70">
                  {assessment?.purpose ?? "Refleksi pemahamanmu."}
                </p>
                <AssessmentForm assignmentId={assignment.id} />
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] px-8 py-14 text-center">
          <ClipboardCheck
            className="mx-auto h-6 w-6 text-[#3d4128]"
            strokeWidth={1.6}
          />
          <h2 className="font-editorial mt-4 text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
            Belum ada assessment
          </h2>
          <p className="mt-2 text-[15px] text-[#0e0f0a]/65">
            Tugas assessment yang aktif akan muncul di sini.
          </p>
        </div>
      )}
    </PageFade>
  );
}
