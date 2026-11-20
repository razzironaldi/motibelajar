"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

type RequestRow = {
  id: string;
  category: string;
  urgency: string;
  status: string;
};
type SlotRow = {
  id: string;
  starts_at: string;
  channel: string;
  status: string;
};

export default function Queue() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/counseling/queue"),
      fetch("/api/counseling/slots"),
    ])
      .then(async ([q, s]) => {
        const queue = await q.json();
        const available = await s.json();
        setRequests(queue.data ?? []);
        setSlots(
          (available.data ?? []).filter(
            (slot: SlotRow) => slot.status === "open"
          )
        );
      })
      .catch(() => setMessage("Antrean belum dapat dimuat."));
  }, []);

  async function offer(requestId: string) {
    const slotId = selected[requestId];
    if (!slotId) return setMessage("Pilih slot terlebih dahulu.");
    const result = await fetch("/api/counseling/appointments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "offer", requestId, slotId }),
    });
    if (!result.ok) {
      return setMessage("Slot sudah dipakai atau permintaan tidak berwenang.");
    }
    setRequests((rows) =>
      rows.map((row) =>
        row.id === requestId ? { ...row, status: "slot_offered" } : row
      )
    );
    setSlots((rows) => rows.filter((row) => row.id !== slotId));
    setMessage("Jadwal ditawarkan.");
  }

  return (
    <section
      aria-labelledby="queue-title"
      className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-9"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0e0f0a]/10 pb-5">
        <h2
          id="queue-title"
          className="font-editorial text-[28px] tracking-[-0.03em] text-[#0e0f0a]"
        >
          Antrean siswa yang ditugaskan
        </h2>
        <span className="tabular-nums text-[14px] font-medium text-[#3d4128]">
          {requests.length} permintaan
        </span>
      </div>

      {requests.length ? (
        <ul className="mt-4 divide-y divide-[#0e0f0a]/10">
          {requests.map((request) => (
            <li key={request.id} className="py-5 first:pt-3 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[15px]">
                  <span className="font-medium capitalize text-[#0e0f0a]">
                    {request.category}
                  </span>
                  <span className="text-[#0e0f0a]/40" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[14px] text-[#0e0f0a]/65">
                    Prioritas {request.urgency}
                  </span>
                </div>
                <span className="text-[12px] font-medium tracking-[0.04em] text-[#3d4128] uppercase">
                  {request.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <select
                  aria-label={`Slot untuk ${request.category}`}
                  value={selected[request.id] ?? ""}
                  onChange={(event) =>
                    setSelected((current) => ({
                      ...current,
                      [request.id]: event.target.value,
                    }))
                  }
                  className="mb-input min-w-0 flex-1"
                >
                  <option value="">Pilih slot jadwal</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.starts_at).toLocaleString("id-ID")} ·{" "}
                      {slot.channel}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => offer(request.id)}
                  className="mb-btn-primary"
                >
                  <CalendarClock className="h-4 w-4" />
                  <span>Tawarkan</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-[18px] bg-[#faf5f1] p-8 text-center">
          <p className="text-[15px] text-[#0e0f0a]/68">Antrean kosong.</p>
        </div>
      )}

      {message && (
        <p role="status" className="mt-5 text-[14px] text-[#3d4128]">
          {message}
        </p>
      )}
    </section>
  );
}
