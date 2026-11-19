import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProgressButton from "./progress-button";

export default async function KursusPage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: courses } = user && supabase ? await supabase.from("lms_courses").select("id,title,description,lms_lessons(id,title,content,order_no)").order("title") : { data: [] };
  return <div className="subpage"><Link className="back-link" href="/app">← Ringkasan</Link><section className="subpage-heading"><p className="eyebrow"><span className="eyebrow-dot" /> Ruang belajar</p><h1>Belajar satu<br /><em>langkah.</em></h1><p>Kursus yang tersedia untukmu, dengan progres yang tersimpan.</p></section>{courses?.length ? <div className="goal-list">{courses.map((course) => <article className="goal-card" key={course.id}><div><p className="panel-kicker">KURSUS</p><h2>{course.title}</h2><p>{course.description}</p><ol className="mt-4 space-y-2 text-sm text-slate-700">{course.lms_lessons?.sort((a, b) => a.order_no - b.order_no).map((lesson) => <li className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3" key={lesson.id}><span>{lesson.title}</span><ProgressButton lessonId={lesson.id} /></li>)}</ol></div></article>)}</div> : <div className="empty-panel"><span className="empty-symbol">◒</span><h2>Belum ada kursus</h2><p>Kursus yang ditugaskan akan muncul di sini.</p></div>}</div>;
}
