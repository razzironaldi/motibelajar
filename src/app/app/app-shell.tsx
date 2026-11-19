"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const navigation = [
  { href: "/app", label: "Ringkasan", icon: "⌂" },
  { href: "/app/belajar", label: "Ruang belajar", icon: "◒" },
  { href: "/app/bk", label: "Pendampingan BK", icon: "◌" },
];

export default function AppShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return <div className="workspace"><aside className="workspace-nav"><Link className="brand" href="/"><span className="brand-mark">M</span><span>MotiBelajar</span></Link><p className="nav-caption">RUANG SISWA</p><nav aria-label="Ruang siswa">{navigation.map((item) => <Link className={pathname === item.href ? "workspace-link active" : "workspace-link"} href={item.href} key={item.href}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav><div className="nav-bottom"><Link className={pathname === "/app/profil" ? "workspace-link active" : "workspace-link"} href="/app/profil"><span aria-hidden="true">◎</span>Profil</Link><button className="workspace-link signout" onClick={signOut}><span aria-hidden="true">↗</span>Keluar</button></div></aside><main className="workspace-main"><header className="workspace-header"><span className="mobile-brand">MotiBelajar</span><span className="workspace-email">{email}</span></header>{children}</main></div>;
}
