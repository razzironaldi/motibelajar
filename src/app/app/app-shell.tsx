"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BookMarked,
  BookOpen,
  ClipboardCheck,
  HeartHandshake,
  Home,
  LogOut,
  Menu,
  SlidersHorizontal,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type Role = "student" | "bk_teacher" | "admin" | "reviewer";

const ROLE_LABELS: Record<Role, string> = {
  student: "Siswa",
  bk_teacher: "Guru BK",
  admin: "Admin",
  reviewer: "Reviewer",
};

const studentNavigation = [
  { href: "/app", label: "Ringkasan", icon: Home },
  { href: "/app/belajar", label: "Tujuan belajar", icon: Target },
  { href: "/app/kursus", label: "Kursus", icon: BookOpen },
  { href: "/app/assessment", label: "Assessment", icon: ClipboardCheck },
  { href: "/app/motivasi", label: "Motivasi", icon: Sparkles },
  { href: "/app/jurnal", label: "Jurnal", icon: BookMarked },
  { href: "/app/bk", label: "Pendampingan BK", icon: HeartHandshake },
];

const staffNavigation = [
  { href: "/app", label: "Ringkasan", icon: Home },
  { href: "/app/bk", label: "Antrean BK", icon: HeartHandshake },
  { href: "/app/staff", label: "Operasi", icon: SlidersHorizontal },
];

export default function AppShell({
  email,
  role,
  children,
}: {
  email: string;
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = role === "student" ? studentNavigation : staffNavigation;

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#faf5f1] text-[#0e0f0a]">
      {/* Desktop Olive Grove Sidebar */}
      <aside className="hidden w-[256px] shrink-0 flex-col bg-[#3d4128] px-5 py-7 text-[#faf5f1] lg:flex">
        <Link
          href="/"
          className="font-editorial px-3 text-[24px] tracking-[-0.02em] text-[#faf5f1] transition-opacity hover:opacity-80"
        >
          MotiBelajar
        </Link>

        <p className="mt-10 px-3 text-[11px] font-medium tracking-[0.14em] text-[#faf5f1]/55 uppercase">
          {role === "student" ? "Ruang siswa" : "Ruang kerja"}
        </p>

        <nav
          aria-label="Navigasi aplikasi"
          className="mt-3 flex flex-1 flex-col gap-1"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[#e1f079]/16 text-[#e1f079]"
                    : "text-[#faf5f1]/78 hover:bg-[#faf5f1]/8 hover:text-[#faf5f1]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-[#e1f079]" : "text-[#faf5f1]/60"
                  }`}
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-[#faf5f1]/12 pt-4">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#faf5f1]/78 transition-colors hover:bg-[#faf5f1]/8 hover:text-[#faf5f1] cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 text-[#faf5f1]/60" strokeWidth={1.75} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-[#0e0f0a]/55"
              aria-hidden="true"
            />
            <motion.aside
              initial={reducedMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reducedMotion ? undefined : { x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 flex w-[272px] flex-col bg-[#3d4128] px-5 py-6 text-[#faf5f1]"
            >
              <div className="flex items-center justify-between px-2">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="font-editorial text-[22px] tracking-[-0.02em] text-[#faf5f1]"
                >
                  MotiBelajar
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Tutup menu navigasi"
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#faf5f1]/80 hover:bg-[#faf5f1]/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-8 px-3 text-[11px] font-medium tracking-[0.14em] text-[#faf5f1]/55 uppercase">
                {role === "student" ? "Ruang siswa" : "Ruang kerja"}
              </p>

              <nav
                aria-label="Navigasi seluler"
                className="mt-3 flex flex-1 flex-col gap-1"
              >
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-[10px] px-3 py-3 text-[14px] font-medium transition-colors ${
                        active
                          ? "bg-[#e1f079]/16 text-[#e1f079]"
                          : "text-[#faf5f1]/82 hover:bg-[#faf5f1]/8 hover:text-[#faf5f1]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-[#faf5f1]/12 pt-4">
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-[14px] font-medium text-[#faf5f1]/82 hover:bg-[#faf5f1]/8"
                >
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>Keluar</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Cream Paper Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[#0e0f0a]/10 bg-[#faf5f1] px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#0e0f0a]/15 bg-[#fefffa] text-[#0e0f0a]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/app"
              className="font-editorial text-[20px] tracking-[-0.02em] text-[#0e0f0a]"
            >
              MotiBelajar
            </Link>
          </div>

          <div className="hidden text-[13px] text-[#0e0f0a]/60 lg:block">
            {ROLE_LABELS[role] ?? "Akun"}
          </div>

          <div className="flex items-center gap-2 text-[13px] text-[#0e0f0a]/70 truncate">
            <span className="truncate">{email}</span>
            <span className="lg:hidden" aria-hidden="true">
              ·
            </span>
            <span className="lg:hidden shrink-0">
              {ROLE_LABELS[role] ?? "Akun"}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1040px] flex-1 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          {children}
        </main>
      </div>
    </div>
  );
}
