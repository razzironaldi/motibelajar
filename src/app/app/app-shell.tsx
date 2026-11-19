"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Role = "student" | "bk_teacher" | "admin" | "reviewer";
const studentNavigation = [
  { href: "/app", label: "Ringkasan", icon: "⌂" },
  { href: "/app/belajar", label: "Tujuan belajar", icon: "◒" },
  { href: "/app/kursus", label: "Kursus", icon: "▤" },
  { href: "/app/motivasi", label: "Motivasi", icon: "✦" },
  { href: "/app/jurnal", label: "Jurnal", icon: "✎" },
  { href: "/app/bk", label: "Pendampingan BK", icon: "◌" },
];
const staffNavigation = [
  { href: "/app", label: "Ringkasan", icon: "⌂" },
  { href: "/app/bk", label: "Antrean BK", icon: "◌" },
];

export default function AppShell({ email, role, children }: { email: string; role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const navigation = role === "student" ? studentNavigation : staffNavigation;
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return <div className="workspace"><aside className="workspace-nav"><Link className="brand" href="/"><span className="brand-mark">M</span><span>MotiBelajar</span></Link><p className="nav-caption">{role === "student" ? "RUANG SISWA" : "RUANG KERJA"}</p><nav aria-label="Navigasi aplikasi">{navigation.map((item) => <Link className={pathname === item.href ? "workspace-link active" : "workspace-link"} href={item.href} key={item.href}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav><div className="nav-bottom">{role === "student" && <Link className={pathname === "/app/profil" ? "workspace-link active" : "workspace-link"} href="/app/profil"><span aria-hidden="true">◎</span>Profil</Link>}<button className="workspace-link signout" onClick={signOut}><span aria-hidden="true">↗</span>Keluar</button></div></aside><main className="workspace-main"><header className="workspace-header"><span className="mobile-brand">MotiBelajar</span><span className="workspace-email">{email}</span></header>{children}</main></div>;
}
