"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
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
    if (!supabase) {
      setMessage(
        "Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu."
      );
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (error) {
      setMessage("Email atau password tidak sesuai.");
      return;
    }
    router.push("/app");
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@sekolah.sch.id"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-input"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Minimal 6 karakter"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-input"
        />
      </div>

      {message && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[12px] border border-[#e7573d]/30 bg-[#e7573d]/10 px-4 py-3 text-[14px] leading-snug text-[#8c2817]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#e7573d]" />
          <span>{message}</span>
        </div>
      )}

      <button
        className="mb-btn-primary w-full"
        type="submit"
        disabled={pending}
      >
        <span>{pending ? "Memeriksa…" : "Masuk ke ruang belajar"}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
