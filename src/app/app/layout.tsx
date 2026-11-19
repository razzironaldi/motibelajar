import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "./app-shell";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <AppShell email={user.email ?? "Akun siswa"}>{children}</AppShell>;
}
