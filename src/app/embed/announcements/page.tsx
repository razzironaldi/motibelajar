import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AnnouncementsEmbed() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.from("public_site_announcements").select("id,slug,title,body,published_at").eq("visible", true).order("published_at", { ascending: false }).limit(10) : { data: [] };
  return <main className="embed-page"><p className="eyebrow"><span className="eyebrow-dot" /> MotiBelajar</p><h1>Pengumuman<br /><em>terbaru.</em></h1>{data?.length ? <div className="embed-list">{data.map((item) => <article className="embed-item" key={item.id}><time>{new Date(item.published_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</time><h2>{item.title}</h2><p>{item.body}</p></article>)}</div> : <div className="empty-panel"><h2>Belum ada pengumuman</h2><p>Konten terbaru akan tampil di sini.</p></div>}<p className="embed-footer">Konten publik MotiBelajar · <Link href="/">Buka aplikasi</Link></p></main>;
}
