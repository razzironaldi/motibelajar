const pillars = [
  { number: "01", title: "Kenali arah", text: "Refleksi motivasi, tujuan belajar, dan rencana yang terasa masuk akal." },
  { number: "02", title: "Belajar terarah", text: "Materi, video, kuis, tugas, dan progress dalam satu ruang belajar." },
  { number: "03", title: "Dampingi dengan aman", text: "Guru BK melihat konteks yang relevan, bukan seluruh kehidupan pribadi siswa." },
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Navigasi utama"><a className="brand" href="#top"><span className="brand-mark">M</span><span>MotiBelajar</span></a><div className="nav-links"><a href="#cara-kerja">Cara kerja</a><a href="#untuk-siapa">Untuk siapa</a><a className="nav-login" href="/login">Masuk <span aria-hidden="true">↗</span></a></div></nav>
      <section className="hero hero-valley" id="top"><div className="valley-glow" aria-hidden="true" /><div className="valley-stars" aria-hidden="true" /><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Ruang tumbuh siswa</p><h1>Belajar dengan<br /><em>arah.</em></h1><p className="hero-lead">Rooted in curiosity.<br />Built for what’s next.</p><div className="hero-actions"><a className="button button-dark" href="/login">Mulai perjalanan <span aria-hidden="true">→</span></a><a className="text-link" href="#cara-kerja">Lihat cara kerja <span aria-hidden="true">↓</span></a></div></div><div className="flower-valley" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></section>
      <section className="trust-row" id="untuk-siapa"><p>Dibangun untuk perjalanan<br />yang <strong>berbeda-beda.</strong></p><div><span>SISWA</span><span>GURU BK</span><span>SEKOLAH</span></div></section>
      <section className="pillars" id="cara-kerja"><div className="section-heading"><p className="eyebrow">Satu ruang, tiga peran</p><h2>Pendampingan yang<br /><em>lebih manusiawi.</em></h2></div><div className="pillar-grid">{pillars.map((pillar) => <article className="pillar" key={pillar.number}><span className="pillar-number">{pillar.number}</span><h3>{pillar.title}</h3><p>{pillar.text}</p><span className="pillar-arrow" aria-hidden="true">↗</span></article>)}</div></section>
      <section className="closing"><p className="eyebrow">Tidak harus sempurna</p><h2>Yang penting,<br /><em>mulai.</em></h2><a className="button button-light" href="/login">Masuk ke MotiBelajar <span aria-hidden="true">→</span></a></section>
      <footer><span>© 2026 MotiBelajar</span><span>Privat sejak awal. Dirancang untuk bertumbuh.</span></footer>
    </main>
  );
}
