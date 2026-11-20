import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import EditorialHighlight from "@/components/EditorialHighlight";
import LoginForm from "./login-form";

export const metadata = {
  title: "Masuk — MotiBelajar",
  description: "Masuk ke ruang belajar dan pendampingan BK MotiBelajar.",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#faf5f1] text-[#0e0f0a] lg:grid-cols-12">
      {/* Left Olive Grove Editorial Column */}
      <aside className="relative flex flex-col justify-between bg-[#3d4128] px-8 py-10 text-[#faf5f1] sm:px-12 lg:col-span-5 lg:py-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-editorial text-[24px] tracking-[-0.02em] text-[#faf5f1] transition-opacity hover:opacity-80"
          >
            MotiBelajar
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#faf5f1]/75 transition-colors hover:text-[#e1f079]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Beranda
          </Link>
        </div>

        <div className="my-14 max-w-md lg:my-0">
          <p className="text-[13px] font-medium text-[#e1f079]">
            Ruang tumbuh siswa
          </p>
          <h2 className="font-editorial mt-4 text-[44px] leading-[0.94] tracking-[-0.045em] text-[#faf5f1] sm:text-[54px]">
            Belajar dengan ritme yang{" "}
            <EditorialHighlight variant="dark">tenang.</EditorialHighlight>
          </h2>
          <p className="mt-6 text-[16px] leading-[1.55] text-[#faf5f1]/78">
            Tetapkan tujuan belajar mingguan, tulis jurnal refleksi pribadi,
            dan jangkau guru BK pendampingmu kapan saja dibutuhkan.
          </p>
        </div>

        <div className="flex items-start gap-3 border-t border-[#faf5f1]/15 pt-6 text-[13px] leading-[1.5] text-[#faf5f1]/72">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-[#e1f079]"
            strokeWidth={1.8}
          />
          <p>
            Jurnal pribadi, refleksi motivasi, dan catatan konseling BK dijaga
            terpisah berdasarkan peran akunmu.
          </p>
        </div>
      </aside>

      {/* Right Cream Paper Login Canvas */}
      <section
        aria-labelledby="login-title"
        className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:col-span-7 lg:px-20"
      >
        <div className="mx-auto w-full max-w-[440px]">
          <p className="text-[13px] font-medium text-[#3d4128]">
            Masuk ke akunmu
          </p>
          <h1
            id="login-title"
            className="font-editorial mt-3 text-[48px] leading-[0.92] tracking-[-0.048em] text-[#0e0f0a] sm:text-[58px]"
          >
            Selamat datang{" "}
            <EditorialHighlight>kembali.</EditorialHighlight>
          </h1>
          <p className="mt-4 text-[16px] leading-[1.5] text-[#0e0f0a]/72">
            Gunakan email dan kata sandi sekolah untuk melanjutkan perjalanan
            belajarmu.
          </p>

          <div className="mt-8 rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-9">
            <LoginForm />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#0e0f0a]/62">
            <span>Ingin melihat konten terbuka?</span>
            <div className="flex items-center gap-4">
              <Link
                href="/embed/courses"
                className="text-[#0e0f0a] underline decoration-[#0e0f0a]/30 underline-offset-4 transition-colors hover:decoration-[#de7653]"
              >
                Kursus publik
              </Link>
              <Link
                href="/embed/announcements"
                className="text-[#0e0f0a] underline decoration-[#0e0f0a]/30 underline-offset-4 transition-colors hover:decoration-[#de7653]"
              >
                Pengumuman
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
