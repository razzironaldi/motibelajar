import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoursesEmbed() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.from("public_site_courses").select("id,slug,title,summary,published_at").eq("visible", true).order("published_at", { ascending: false }).limit(20) : { data: [] };
  return <main className="embed-page"><p className="eyebrow"><span className="eyebrow-dot" /> MotiBelajar</p><h1>Ruang belajar<br /><em>terbuka.</em></h1>{data?.length ? <div className="embed-list">{data.map((item) => <article className="embed-item" key={item.id}><h2>{item.title}</h2><p>{item.summary}</p><Link className="text-link" href={`/embed/courses/${item.slug}`}>Lihat ringkasan ↗</Link></article>)}</div> : <div className="empty-panel"><h2>Belum ada kursus publik</h2><p>Kursus yang sudah diterbitkan akan tampil di sini.</p></div>}<p className="embed-footer">Konten publik MotiBelajar · <Link href="/">Buka aplikasi</Link></p></main>;
}
