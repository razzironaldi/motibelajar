"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  HeartHandshake,
  Lock,
  ShieldCheck,
} from "lucide-react";
import EditorialHighlight from "./EditorialHighlight";
import { Reveal, ScoreCircle } from "./MotionPrimitives";

const ROLES = [
  { name: "Siswa", detail: "Tujuan, jurnal, motivasi & kursus" },
  { name: "Guru BK", detail: "Antrean & sesi privat terarah" },
  { name: "Reviewer", detail: "Kurasi instrumen & kualitas" },
  { name: "Admin Sekolah", detail: "Operasi terbatas tanpa catatan privat" },
  { name: "Ruang Publik", detail: "Pengumuman & kursus terbuka" },
];

const CHAPTERS = [
  {
    number: "01",
    id: "arah",
    title: "Motivasi & Tujuan Belajar",
    subtitle: "Refleksi deskriptif tanpa label dan tanpa peringkat.",
    description:
      "Siswa menetapkan tujuan belajar yang terukur dengan langkah kecil mingguan. Cek-in motivasi menghasilkan gambaran deskriptif untuk refleksi diri — bukan diagnosis atau penentuan risiko otomatis.",
    highlights: [
      "Target belajar pribadi lengkap dengan ukuran keberhasilan dan tenggat.",
      "Langkah rencana belajar bertahap yang mudah dipantau setiap hari.",
      "Instrumen cek-in motivasi 4-skala yang menenangkan dan bebas stigma.",
    ],
    previewTitle: "Tujuan Aktif Pekan Ini",
    previewItems: [
      { label: "Memahami dasar aljabar linear", meta: "4/5 langkah selesai" },
      { label: "Ringkasan catatan biologi sel", meta: "2/3 langkah selesai" },
      { label: "Refleksi ritme belajar mingguan", meta: "Siap diisi" },
    ],
    ctaLabel: "Mulai tetapkan tujuan",
    ctaHref: "/login",
  },
  {
    number: "02",
    id: "ruang-belajar",
    title: "Kursus, Kuis & Jurnal Privat",
    subtitle: "Catat proses belajar, bukan sekadar hasil akhir.",
    description:
      "Materi kursus terstruktur, kuis formatif, dan cek pemahaman berjalan dalam satu ruang tenang. Jurnal belajar tersimpan privat dan dapat direvisi kapan saja tanpa menghapus riwayat pertumbuhan.",
    highlights: [
      "Progres pelajaran tersimpan otomatis di setiap langkah kursus.",
      "Kunci jawaban dan perhitungan assessment tetap terpisah dan privat.",
      "Jurnal refleksi harian yang sepenuhnya berada dalam kendali siswa.",
    ],
    previewTitle: "Catatan Jurnal Terbaru",
    previewItems: [
      { label: "Cara baru mengurai soal cerita fisika", meta: "Privat · Direvisi hari ini" },
      { label: "Kuis Pengantar Statistika Deskriptif", meta: "Tersedia untuk dicoba" },
      { label: "Pelajaran 03: Strategi Fokus 25 Menit", meta: "Selesai dipelajari" },
    ],
    ctaLabel: "Lihat kursus publik",
    ctaHref: "/embed/courses",
  },
  {
    number: "03",
    id: "bk",
    title: "Pendampingan BK yang Aman",
    subtitle: "Konteks secukupnya, privasi terjaga sejak awal.",
    description:
      "Siswa dapat mengajukan permintaan konseling dengan prioritas dan topik pilihan mereka. Guru BK hanya melihat antrean siswa yang ditugaskan kepadanya dan menawarkan jadwal secara transparan.",
    highlights: [
      "Permintaan konseling terhubung langsung ke guru BK pendamping utama.",
      "Penawaran jadwal sesi privat tanpa membuka catatan pribadi ke pihak lain.",
      "Pemisahan ketat antara data operasional sekolah dan catatan konseling.",
    ],
    previewTitle: "Alur Pendampingan Privat",
    previewItems: [
      { label: "Pengajuan topik belajar / pribadi / karier", meta: "Hanya terlihat oleh guru BK utama" },
      { label: "Penawaran slot tatap muka atau daring", meta: "Konfirmasi jadwal jelas" },
      { label: "Catatan sesi & tindak lanjut terlindungi", meta: "Akses berbasis peran (RLS)" },
    ],
    ctaLabel: "Buka ruang pendampingan",
    ctaHref: "/login",
  },
];

const ETHICS = [
  {
    title: "Tanpa diagnosis otomatis",
    body: "Hasil refleksi motivasi bersifat deskriptif untuk membantu siswa mengenal pola belajarnya — bukan label klinis, peringkat, atau skor risiko.",
  },
  {
    title: "Catatan BK tetap privat",
    body: "Hanya guru BK yang ditugaskan secara aktif yang dapat mendampingi permintaan siswa. Admin operasional tidak pernah melihat isi catatan pribadi.",
  },
  {
    title: "Kunci jawaban terisolasi",
    body: "Permintaan dari sisi siswa tidak pernah mengambil kunci jawaban, bobot penilaian, maupun konfigurasi skor assessment di server.",
  },
  {
    title: "Akses publik terbatas secara sadar",
    body: "Halaman terbuka hanya menampilkan proyeksi publik resmi untuk pengumuman sekolah dan katalog kursus yang memang telah diterbitkan.",
  },
];

export default function LandingSections() {
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  const reducedMotion = useReducedMotion();
  const activeChapter =
    CHAPTERS.find((chapter) => chapter.id === activeId) ?? CHAPTERS[0];

  return (
    <div className="bg-[#faf5f1] text-[#0e0f0a]">
      {/* Section 1: Kindsight Mission & Role Trust Bar */}
      <section
        id="pengantar"
        aria-labelledby="trust-heading"
        className="border-b border-[#0e0f0a]/12 bg-[#faf5f1] py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
          <Reveal className="text-center">
            <h2
              id="trust-heading"
              className="font-editorial mx-auto max-w-3xl text-[36px] leading-[1.02] tracking-[-0.04em] text-[#0e0f0a] sm:text-[46px]"
            >
              Mendampingi setiap{" "}
              <EditorialHighlight>ritme</EditorialHighlight> belajar.
            </h2>
          </Reveal>

          <div
            id="peran"
            className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[#0e0f0a]/10 pt-10 sm:grid-cols-3 lg:grid-cols-5"
          >
            {ROLES.map((role, idx) => (
              <Reveal
                key={role.name}
                delay={idx * 0.05}
                y={12}
                className="flex flex-col gap-1"
              >
                <span className="font-editorial text-[22px] leading-tight tracking-[-0.025em] text-[#0e0f0a]">
                  {role.name}
                </span>
                <span className="text-[13px] leading-[1.4] text-[#0e0f0a]/65">
                  {role.detail}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Kindsight Olive Grove Full-Bleed Showcase */}
      <section
        id="cara-kerja"
        aria-labelledby="showcase-heading"
        className="bg-[#3d4128] py-24 text-[#faf5f1] lg:py-28"
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Copy (45%) */}
          <Reveal className="lg:col-span-5">
            <p className="text-[13px] font-medium tracking-[0.04em] text-[#e1f079]">
              Satu ruang, tanpa kebisingan
            </p>
            <h2
              id="showcase-heading"
              className="font-editorial mt-5 text-[48px] leading-[0.9] tracking-[-0.048em] text-[#faf5f1] sm:text-[60px]"
            >
              Ruang belajar yang melihat manusia{" "}
              <EditorialHighlight variant="dark">seutuhnya.</EditorialHighlight>
            </h2>
            <p className="mt-7 max-w-[440px] text-[17px] leading-[1.55] text-[#faf5f1]/82">
              MotiBelajar menyatukan refleksi motivasi, rencana tujuan belajar,
              kursus akademik terbatas, dan pendampingan guru BK dalam satu
              ekosistem tenang yang menghargai privasi siswa.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/login" className="mb-btn-chartreuse">
                Masuk ke ruang belajar
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/embed/courses"
                className="inline-flex items-center gap-1.5 text-[15px] text-[#faf5f1]/85 transition-colors hover:text-[#e1f079] whitespace-nowrap"
              >
                Lihat katalog terbuka
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          {/* Right Layered Kindsight Product Mockup (55%) */}
          <Reveal delay={0.12} className="relative lg:col-span-7">
            <div className="relative mx-auto max-w-[600px] pb-12 pt-6 sm:pb-14 sm:pt-10">
              {/* Primary Soft Linen Workspace Card */}
              <div className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 text-[#0e0f0a] shadow-[0_1px_2px_rgba(14,15,10,0.06)] sm:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#0e0f0a]/10 pb-6">
                  <div>
                    <p className="text-[12px] font-medium text-[#0e0f0a]/55">
                      Ruang Pribadi · Semester Genap
                    </p>
                    <h3 className="font-editorial mt-1.5 text-[30px] leading-[1.02] tracking-[-0.03em] text-[#0e0f0a]">
                      Ritme belajar minggu ini
                    </h3>
                  </div>
                  <span className="text-[13px] font-medium tabular-nums text-[#3d4128]">
                    3 tujuan aktif
                  </span>
                </div>

                <div className="mt-7 grid items-center gap-7 sm:grid-cols-[150px_1fr]">
                  <ScoreCircle
                    value={78}
                    label="Langkah rencana belajar tercapai pekan ini"
                    size={124}
                  />

                  <ul className="space-y-3.5">
                    {[
                      {
                        title: "Selesaikan 15 latihan fungsi kuadrat",
                        meta: "Tujuan aktif · Tenggat Jumat",
                        done: true,
                      },
                      {
                        title: "Cek-in refleksi motivasi belajar",
                        meta: "Deskriptif · Tanpa peringkat",
                        done: true,
                      },
                      {
                        title: "Tulis catatan proses di jurnal privat",
                        meta: "Tersimpan lokal untuk dirimu",
                        done: false,
                      },
                    ].map((item) => (
                      <li
                        key={item.title}
                        className="flex items-start gap-3 border-b border-[#0e0f0a]/8 pb-3 last:border-b-0 last:pb-0"
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            item.done
                              ? "bg-[#e1f079] text-[#0e0f0a]"
                              : "border border-[#0e0f0a]/25 bg-transparent"
                          }`}
                        >
                          {item.done ? <Check className="h-3 w-3" /> : null}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium leading-snug text-[#0e0f0a]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[#0e0f0a]/58">
                            {item.meta}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Floating Kindsight Notification Alert Badge (Top Right) */}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative mt-4 rounded-[18px] border border-[#0e0f0a]/12 bg-[#fefffa] px-5 py-4 text-[#0e0f0a] shadow-[0_1px_2px_rgba(14,15,10,0.06)] sm:absolute sm:-top-2 sm:right-0 sm:mt-0 sm:w-[272px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium tracking-[0.06em] text-[#0e0f0a]/60 uppercase">
                    Pendampingan BK
                  </span>
                  <span
                    aria-label="Notifikasi jadwal baru"
                    className="h-2 w-2 rounded-full bg-[#e7573d]"
                  />
                </div>
                <p className="mt-1.5 text-[15px] font-medium text-[#0e0f0a]">
                  Bu Ratna Lestari
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-[#0e0f0a]/70">
                  Jadwal sesi privat tersedia Kamis, 10.00 WIB.
                </p>
              </motion.div>

              {/* Floating Warm Sand Reflection Strip (Bottom Left) */}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.55, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="relative mt-4 rounded-[20px] border border-[#0e0f0a]/10 bg-[#faf5f1] px-5 py-4 text-[#0e0f0a] sm:absolute sm:bottom-0 sm:left-6 sm:mt-0 sm:w-[320px]"
              >
                <div className="flex items-center justify-between text-[12px] text-[#0e0f0a]/65">
                  <span>Jurnal belajar privat</span>
                  <span>Hanya kamu</span>
                </div>
                <p className="mt-1.5 text-[14px] leading-[1.45] text-[#0e0f0a]">
                  &ldquo;Ternyata memecah latihan jadi 20 menit membuat saya
                  lebih tenang sebelum mulai.&rdquo;
                </p>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 3: Interactive Editorial Pillar Explorer (Cream Paper) */}
      <section
        aria-labelledby="pillars-heading"
        className="bg-[#faf5f1] py-24 lg:py-28"
      >
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
          <Reveal className="max-w-2xl">
            <p className="text-[13px] font-medium text-[#3d4128]">
              Tiga fondasi MotiBelajar
            </p>
            <h2
              id="pillars-heading"
              className="font-editorial mt-4 text-[44px] leading-[0.92] tracking-[-0.045em] text-[#0e0f0a] sm:text-[56px]"
            >
              Pendampingan yang terasa lebih{" "}
              <EditorialHighlight>manusiawi.</EditorialHighlight>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Interactive Chapter Selector */}
            <div className="flex flex-col divide-y divide-[#0e0f0a]/12 border-y border-[#0e0f0a]/12 lg:col-span-5">
              {CHAPTERS.map((chapter) => {
                const isActive = chapter.id === activeChapter.id;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveId(chapter.id)}
                    aria-pressed={isActive}
                    className={`group flex w-full items-start gap-5 py-7 text-left transition-colors ${
                      isActive ? "text-[#0e0f0a]" : "text-[#0e0f0a]/60 hover:text-[#0e0f0a]"
                    }`}
                  >
                    <span
                      className={`font-editorial tabular-nums text-[22px] leading-none transition-colors ${
                        isActive ? "text-[#de7653]" : "text-[#0e0f0a]/40"
                      }`}
                    >
                      {chapter.number}
                    </span>
                    <span className="flex-1">
                      <span className="font-editorial block text-[28px] leading-[1.05] tracking-[-0.03em]">
                        {chapter.title}
                      </span>
                      <span className="mt-2 block text-[14px] leading-[1.45] text-[#0e0f0a]/68">
                        {chapter.subtitle}
                      </span>
                    </span>
                    <ArrowRight
                      className={`mt-1 h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isActive
                          ? "translate-x-1 text-[#0e0f0a]"
                          : "opacity-30 group-hover:translate-x-1 group-hover:opacity-80"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Soft Linen Editorial Detail Panel */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeChapter.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-8 sm:p-10"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-[#0e0f0a]/10 pb-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#faf5f1] text-[#3d4128]">
                        {activeChapter.id === "arah" ? (
                          <Compass className="h-5 w-5" strokeWidth={1.6} />
                        ) : activeChapter.id === "ruang-belajar" ? (
                          <BookOpen className="h-5 w-5" strokeWidth={1.6} />
                        ) : (
                          <HeartHandshake className="h-5 w-5" strokeWidth={1.6} />
                        )}
                      </span>
                      <div>
                        <p className="text-[12px] text-[#0e0f0a]/55">
                          Bagian {activeChapter.number}
                        </p>
                        <h3 className="font-editorial text-[28px] leading-tight tracking-[-0.03em] text-[#0e0f0a]">
                          {activeChapter.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-[16px] leading-[1.6] text-[#0e0f0a]/82">
                    {activeChapter.description}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {activeChapter.highlights.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 text-[15px] leading-[1.5] text-[#0e0f0a]/80"
                      >
                        <Check
                          className="mt-1 h-4 w-4 shrink-0 text-[#3d4128]"
                          strokeWidth={2}
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Preview List inside Warm Sand subtle strip */}
                  <div className="mt-8 rounded-[18px] bg-[#faf5f1] p-5 sm:p-6">
                    <p className="text-[12px] font-medium text-[#0e0f0a]/55">
                      {activeChapter.previewTitle}
                    </p>
                    <ul className="mt-3 divide-y divide-[#0e0f0a]/10">
                      {activeChapter.previewItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-1 last:pb-0"
                        >
                          <span className="text-[14px] font-medium text-[#0e0f0a]">
                            {item.label}
                          </span>
                          <span className="text-[13px] text-[#0e0f0a]/60">
                            {item.meta}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link href={activeChapter.ctaHref} className="mb-btn-primary">
                      {activeChapter.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Privacy & Ethical Architecture (Warm Sand) */}
      <section
        aria-labelledby="ethics-heading"
        className="border-y border-[#0e0f0a]/10 bg-[#e5e1d6] py-24 lg:py-28"
      >
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#3d4128]">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                <span>Prinsip privasi sejak awal</span>
              </div>
              <h2
                id="ethics-heading"
                className="font-editorial mt-4 text-[42px] leading-[0.94] tracking-[-0.045em] text-[#0e0f0a] sm:text-[52px]"
              >
                Dirancang untuk rasa{" "}
                <EditorialHighlight>aman</EditorialHighlight> setiap siswa.
              </h2>
              <p className="mt-6 max-w-[420px] text-[16px] leading-[1.55] text-[#0e0f0a]/78">
                Setiap tabel dan batas akses di MotiBelajar dibangun dengan
                aturan privasi ketat agar siswa bebas bertumbuh tanpa khawatir
                data refleksi pribadinya terbuka.
              </p>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
              {ETHICS.map((item, idx) => (
                <Reveal
                  key={item.title}
                  delay={idx * 0.06}
                  className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7"
                >
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[#3d4128]">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
                    <span>0{idx + 1}</span>
                  </div>
                  <h3 className="font-editorial mt-4 text-[26px] leading-[1.08] tracking-[-0.03em] text-[#0e0f0a]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-[#0e0f0a]/72">
                    {item.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Closing Olive Grove Banner */}
      <section
        aria-labelledby="closing-heading"
        className="bg-[#3d4128] py-24 text-center text-[#faf5f1] lg:py-28"
      >
        <div className="mx-auto max-w-[900px] px-6 sm:px-10">
          <Reveal>
            <p className="text-[13px] font-medium tracking-[0.04em] text-[#e1f079]">
              Tidak harus sempurna
            </p>
            <h2
              id="closing-heading"
              className="font-editorial mt-5 text-[52px] leading-[0.88] tracking-[-0.05em] text-[#faf5f1] sm:text-[74px]"
            >
              Yang penting,{" "}
              <EditorialHighlight variant="dark">mulai.</EditorialHighlight>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[17px] leading-[1.5] text-[#faf5f1]/80">
              Masuk ke akun MotiBelajar untuk melanjutkan rencana belajar,
              menulis jurnal, atau menjadwalkan pendampingan BK.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="mb-btn-chartreuse">
                Masuk ke MotiBelajar
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/embed/announcements"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#faf5f1]/30 px-5 py-3 text-[15px] font-medium text-[#faf5f1] transition-colors hover:border-[#e1f079] hover:text-[#e1f079] whitespace-nowrap"
              >
                Pengumuman publik
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#0e0f0a]/10 bg-[#faf5f1] py-10 text-[#0e0f0a]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center sm:px-10">
          <div className="flex flex-col gap-1">
            <span className="font-editorial text-[22px] tracking-[-0.02em] text-[#0e0f0a]">
              MotiBelajar
            </span>
            <span className="text-[13px] text-[#0e0f0a]/60">
              Privat sejak awal. Dirancang untuk bertumbuh.
            </span>
          </div>

          <nav
            aria-label="Navigasi footer"
            className="flex flex-wrap items-center gap-6 text-[14px] text-[#0e0f0a]/75"
          >
            <Link
              href="/embed/courses"
              className="transition-colors hover:text-[#0e0f0a] whitespace-nowrap"
            >
              Kursus Publik
            </Link>
            <Link
              href="/embed/announcements"
              className="transition-colors hover:text-[#0e0f0a] whitespace-nowrap"
            >
              Pengumuman
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-[#0e0f0a] whitespace-nowrap"
            >
              Masuk
            </Link>
            <span className="text-[13px] text-[#0e0f0a]/45">
              © 2026 MotiBelajar
            </span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
