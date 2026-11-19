"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestForm() {
  const router = useRouter();
  const [category, setCategory] = useState("belajar");
  const [urgency, setUrgency] = useState("normal");
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setMessage("");
    try {
      const response = await fetch("/api/counseling/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ category, urgency, reason }) });
      const result = await response.json() as { error?: { code?: string } };
      if (!response.ok) throw new Error(result.error?.code ?? "request_failed");
      setReason("");
      setState("success");
      setMessage("Permintaan konseling terkirim.");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error && error.message === "no_assigned_counselor" ? "Belum ada guru BK utama yang ditetapkan." : "Permintaan belum dapat dikirim.");
    }
  }

  return <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div><label htmlFor="category" className="text-sm font-semibold text-slate-800">Kategori</label><select id="category" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"><option value="belajar">Belajar</option><option value="pribadi">Pribadi</option><option value="sosial">Sosial</option><option value="karier">Karier</option><option value="lainnya">Lainnya</option></select></div>
    <div><label htmlFor="urgency" className="text-sm font-semibold text-slate-800">Prioritas</label><select id="urgency" value={urgency} onChange={(event) => setUrgency(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"><option value="normal">Normal</option><option value="segera">Segera</option></select></div>
    <div><label htmlFor="reason" className="text-sm font-semibold text-slate-800">Hal yang ingin dibicarakan</label><textarea id="reason" required minLength={1} maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2" /></div>
    <button disabled={state === "pending"} className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{state === "pending" ? "Mengirim…" : "Kirim permintaan"}</button>
    {message && <p role="status" className={state === "error" ? "text-sm text-rose-700" : "text-sm text-emerald-700"}>{message}</p>}
  </form>;
}
