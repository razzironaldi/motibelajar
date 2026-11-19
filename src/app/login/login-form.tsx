"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createClient();
    if (!supabase) { setMessage("Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu."); return; }
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPending(false);
    if (error) { setMessage("Email atau password tidak sesuai."); return; }
    router.push("/app");
  }

  return <form className="auth-form" onSubmit={submit}>
    <label htmlFor="email">Email</label>
    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
    <label htmlFor="password">Password</label>
    <input id="password" name="password" type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
    {message && <p className="form-message" role="alert">{message}</p>}
    <button className="button button-dark auth-submit" type="submit" disabled={pending}>{pending ? "Memeriksa…" : "Masuk"}<span aria-hidden="true">→</span></button>
  </form>;
}
