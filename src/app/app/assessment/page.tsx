import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AssessmentForm from "./assessment-form";

export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: assignments } = user && supabase ? await supabase.from("assessment_assignments").select("id,opens_at,closes_at,attempt_limit,assessment_versions(assessment_id,version_no,assessments(name,purpose))").eq("student_id", user.id).order("opens_at", { ascending: false }) : { data: [] };
  return <div className="subpage"><Link className="back-link" href="/app">← Ringkasan</Link><section className="subpage-heading"><p className="eyebrow"><span className="eyebrow-dot" /> Cek pemahaman</p><h1>Jawab dengan<br /><em>tenang.</em></h1><p>Assessment terbatas pada tugas yang ditujukan untukmu. Kunci jawaban dan perhitungan tetap privat.</p></section>{assignments?.length ? <div className="space-y-5">{assignments.map((assignment) => { const version = Array.isArray(assignment.assessment_versions) ? assignment.assessment_versions[0] : assignment.assessment_versions; const assessment = version && (Array.isArray(version.assessments) ? version.assessments[0] : version.assessments); return <article className="workspace-panel p-6" key={assignment.id}><p className="panel-kicker">ASSESSMENT</p><h2 className="mt-2 text-xl font-semibold">{assessment?.name ?? "Assessment belajar"}</h2><p className="mt-2 text-slate-600">{assessment?.purpose ?? "Refleksi pemahamanmu."}</p><AssessmentForm assignmentId={assignment.id} /></article>; })}</div> : <div className="empty-panel"><span className="empty-symbol">✦</span><h2>Belum ada assessment</h2><p>Tugas assessment yang aktif akan muncul di sini.</p></div>}</div>;
}
