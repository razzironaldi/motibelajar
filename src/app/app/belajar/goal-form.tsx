"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoalForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetMetric, setTargetMetric] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const values = new FormData(event.currentTarget);
    const response = await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: String(values.get("title") ?? "").trim(), targetMetric: String(values.get("targetMetric") ?? "").trim(), deadline: String(values.get("deadline") ?? "") }) });
    const result = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) { setMessage("Tujuan belum tersimpan. Periksa isianmu."); return; }
    setTitle(""); setTargetMetric(""); setDeadline(""); setOpen(false); setMessage("Tujuan tersimpan."); router.refresh();
    void result;
  }

  if (!open) return <button className="button button-dark" type="button" onClick={() => setOpen(true)}>Tambah tujuan <span aria-hidden="true">+</span></button>;
  return <form className="goal-form" onSubmit={submit}><label htmlFor="goal-title">Tujuan</label><input id="goal-title" name="title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: memahami aljabar dasar" /><label htmlFor="goal-target">Ukuran keberhasilan</label><input id="goal-target" name="targetMetric" required maxLength={240} value={targetMetric} onChange={(event) => setTargetMetric(event.target.value)} placeholder="Contoh: menyelesaikan 20 soal" /><label htmlFor="goal-deadline">Batas waktu</label><input id="goal-deadline" name="deadline" required type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />{message && <p className="form-message" role="status">{message}</p>}<div className="form-actions"><button className="button button-dark" disabled={pending} type="submit">{pending ? "Menyimpan…" : "Simpan tujuan"}</button><button className="button button-light" type="button" onClick={() => setOpen(false)}>Batal</button></div></form>;
}
