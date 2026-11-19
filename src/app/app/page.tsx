import Link from "next/link";
import { createClient } from "@/lib/supabase/server";


export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: goals } = user && supabase ? await supabase.from("goals").select("id,title,status,deadline").eq("student_id", user.id).order("created_at", { ascending: false }).limit(5) : { data: [] };
  const activeGoals = goals?.filter((goal) => goal.status === "active").length ?? 0;
  return <div className="dashboard"><section className="dashboard-intro"><p className="eyebrow"><span className="eyebrow-dot" /> Ruang pribadimu</p><h1>Mulai dari<br /><em>yang kecil.</em></h1><p className="dashboard-lead">Satu langkah hari ini cukup untuk menjaga arah tetap terlihat.</p></section><section className="stat-grid" aria-label="Ringkasan progress"><article className="stat-card green"><strong>{activeGoals}</strong><span>tujuan aktif</span></article><article className="stat-card cream"><strong>{goals?.length ?? 0}</strong><span>tujuan tersimpan</span></article><article className="stat-card dark"><strong>—</strong><span>sesi BK berikutnya</span></article></section><section className="dashboard-grid"><article className="workspace-panel feature-panel"><div><p className="panel-kicker">TUJUAN BELAJAR</p><h2>{goals?.[0] ? goals[0].title : <>Belum ada tujuan<br />yang dimulai.</>}</h2><p className="panel-copy">{goals?.[0] ? `Target selesai ${new Date(goals[0].deadline).toLocaleDateString("id-ID")}.` : "Tulis satu tujuan yang ingin kamu capai minggu ini."}</p><Link className="button button-dark" href="/app/belajar">Kelola tujuan <span aria-hidden="true">→</span></Link></div><div className="panel-mark" aria-hidden="true">✦</div></article><article className="workspace-panel support-panel"><p className="panel-kicker">PENDAMPINGAN BK</p><h2>Butuh tempat<br /><em>bercerita?</em></h2><p className="panel-copy">Ajukan permintaan sesi dengan guru BK yang mendampingi kamu.</p><Link className="text-link" href="/app/bk">Buka pendampingan <span aria-hidden="true">↗</span></Link></article></section></div>;
}
