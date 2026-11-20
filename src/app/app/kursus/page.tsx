import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import { PageFade } from "@/components/MotionPrimitives";
import { createClient } from "@/lib/supabase/server";
import ProgressButton from "./progress-button";
import QuizForm from "./quiz-form";

export default async function KursusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: courses } =
    user && supabase
      ? await supabase
          .from("lms_courses")
          .select("id,title,description,lms_lessons(id,title,content,order_no)")
          .order("title")
      : { data: [] };

  const { data: quizzes } =
    user && supabase
      ? await supabase
          .from("lms_quiz_assignments")
          .select("id,quiz_id,course_id,attempt_limit")
          .eq("student_id", user.id)
          .eq("status", "active")
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
        <p className="text-[13px] font-medium text-[#3d4128]">Ruang belajar</p>
        <h1 className="font-editorial mt-3 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[58px]">
          Belajar satu{" "}
          <EditorialHighlight>langkah.</EditorialHighlight>
        </h1>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#0e0f0a]/72">
          Kursus yang tersedia untukmu, dengan progres yang tersimpan di setiap
          bagian.
        </p>
      </section>

      {courses?.length ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <article
              className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-9"
              key={course.id}
            >
              <p className="text-[12px] font-medium tracking-[0.06em] text-[#3d4128] uppercase">
                Kursus
              </p>
              <h2 className="font-editorial mt-2 text-[30px] leading-tight tracking-[-0.03em] text-[#0e0f0a]">
                {course.title}
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-[#0e0f0a]/72">
                {course.description}
              </p>

              <ol className="mt-6 divide-y divide-[#0e0f0a]/10 border-t border-[#0e0f0a]/10">
                {course.lms_lessons
                  ?.sort((a, b) => a.order_no - b.order_no)
                  .map((lesson, idx) => (
                    <li
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                      key={lesson.id}
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="tabular-nums text-[13px] text-[#0e0f0a]/45">
                          0{idx + 1}
                        </span>
                        <span className="text-[15px] font-medium text-[#0e0f0a]">
                          {lesson.title}
                        </span>
                      </div>
                      <ProgressButton lessonId={lesson.id} />
                    </li>
                  ))}
              </ol>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] px-8 py-14 text-center">
          <BookOpen
            className="mx-auto h-6 w-6 text-[#3d4128]"
            strokeWidth={1.6}
          />
          <h2 className="font-editorial mt-4 text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
            Belum ada kursus
          </h2>
          <p className="mt-2 text-[15px] text-[#0e0f0a]/65">
            Kursus yang ditugaskan akan muncul di sini.
          </p>
        </div>
      )}

      {quizzes?.length ? (
        <section className="space-y-5 border-t border-[#0e0f0a]/12 pt-10">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[#3d4128] uppercase">
            Kuis aktif
          </p>
          {quizzes.map((quiz) => (
            <article
              className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-9"
              key={quiz.id}
            >
              <h2 className="font-editorial text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
                Kuis kursus
              </h2>
              <QuizForm assignmentId={quiz.id} />
            </article>
          ))}
        </section>
      ) : null}
    </PageFade>
  );
}
