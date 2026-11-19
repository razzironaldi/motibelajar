import Link from "next/link";

export default function BkPage() {
  return <div className="subpage"><Link className="back-link" href="/app">← Ringkasan</Link><section className="subpage-heading"><p className="eyebrow"><span className="eyebrow-dot" /> Pendampingan BK</p><h1>Kamu tidak harus<br /><em>menyimpan semua.</em></h1><p>Ruang privat untuk meminta dukungan dari guru BK yang mendampingi kamu.</p></section><div className="empty-panel support-empty"><span className="empty-symbol">◌</span><h2>Belum ada sesi terjadwal</h2><p>Fitur permintaan sesi tersedia setelah sekolah mengaktifkan pendampingan.</p></div></div>;
}
