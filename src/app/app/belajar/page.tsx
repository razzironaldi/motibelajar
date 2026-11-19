import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GoalForm from "./goal-form";

export default async function BelajarPage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: goals } = user && supabase ? await supabase.from("goals").select("id,title,target_metric,deadline,status,study_plan_items(id,action,status)").eq("student_id", user.id).order("created_at", { ascending: false }) : { data: [] };
  return <div className="subpage"><Link className="back-link" href="/app">← Ringkasan</Link><section className="subpage-heading"><p className="eyebrow"><span className="eyebrow-dot" /> Ruang belajar</p><h1>Belajar sesuai<br /><em>ritmemu.</em></h1><p>Tetapkan arah kecil. Ukur langkahnya. Kembali lagi saat siap.</p><div className="page-action"><GoalForm /></div></section>{goals?.length ? <div className="goal-list">{goals.map((goal) => <article className="goal-card" key={goal.id}><div><p className="panel-kicker">{goal.status === "active" ? "AKTIF" : "SELESAI"}</p><h2>{goal.title}</h2><p>{goal.target_metric}</p></div><time dateTime={goal.deadline}>{new Date(goal.deadline).toLocaleDateString("id-ID", { dateStyle: "medium" })}</time><div className="goal-items">{goal.study_plan_items?.length ? `${goal.study_plan_items.filter((item) => item.status === "completed").length}/${goal.study_plan_items.length} langkah selesai` : "Belum ada langkah"}</div></article>)}</div> : <div className="empty-panel"><span className="empty-symbol">◒</span><h2>Belum ada tujuan</h2><p>Mulai dengan satu tujuan yang bisa kamu ukur minggu ini.</p><GoalForm /></div>}</div>;
}
