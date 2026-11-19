"use client";

import { useEffect, useState } from "react";

type RequestRow = { id: string; category: string; urgency: string; status: string };
type SlotRow = { id: string; starts_at: string; channel: string; status: string };

export default function Queue() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  useEffect(() => { Promise.all([fetch("/api/counseling/queue"), fetch("/api/counseling/slots")]).then(async ([q, s]) => { const queue = await q.json(); const available = await s.json(); setRequests(queue.data ?? []); setSlots((available.data ?? []).filter((slot: SlotRow) => slot.status === "open")); }).catch(() => setMessage("Antrean belum dapat dimuat.")); }, []);
  async function offer(requestId: string) { const slotId = selected[requestId]; if (!slotId) return setMessage("Pilih slot terlebih dahulu."); const result = await fetch("/api/counseling/appointments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "offer", requestId, slotId }) }); if (!result.ok) return setMessage("Slot sudah dipakai atau permintaan tidak berwenang."); setRequests((rows) => rows.map((row) => row.id === requestId ? { ...row, status: "slot_offered" } : row)); setSlots((rows) => rows.filter((row) => row.id !== slotId)); setMessage("Jadwal ditawarkan."); }
  return <section aria-labelledby="queue-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 id="queue-title" className="text-lg font-semibold text-slate-950">Antrean siswa yang ditugaskan</h2><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{requests.length} permintaan</span></div>{requests.length ? <ul className="mt-4 space-y-3">{requests.map((request) => <li key={request.id} className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><span className="font-medium capitalize text-slate-900">{request.category}</span><span className="text-xs font-semibold uppercase text-indigo-700">{request.status}</span></div><p className="mt-1 text-sm text-slate-600">Prioritas {request.urgency}</p><div className="mt-3 flex gap-2"><select aria-label={`Slot untuk ${request.category}`} value={selected[request.id] ?? ""} onChange={(event) => setSelected((current) => ({ ...current, [request.id]: event.target.value }))} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"><option value="">Pilih slot</option>{slots.map((slot) => <option key={slot.id} value={slot.id}>{new Date(slot.starts_at).toLocaleString("id-ID")} · {slot.channel}</option>)}</select><button onClick={() => offer(request.id)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white">Tawarkan</button></div></li>)}</ul> : <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Antrean kosong.</p>}{message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}</section>; 
}
