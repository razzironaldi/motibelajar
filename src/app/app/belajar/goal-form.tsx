"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, X } from "lucide-react";

export default function GoalForm() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetMetric, setTargetMetric] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const values = new FormData(event.currentTarget);
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(values.get("title") ?? "").trim(),
        targetMetric: String(values.get("targetMetric") ?? "").trim(),
        deadline: String(values.get("deadline") ?? ""),
      }),
    });
    const result = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setMessage("Tujuan belum tersimpan. Periksa isianmu.");
      return;
    }
    setTitle("");
    setTargetMetric("");
    setDeadline("");
    setOpen(false);
    setMessage("Tujuan tersimpan.");
    router.refresh();
    void result;
  }

  return (
    <div>
      {!open && (
        <div className="flex flex-wrap items-center gap-4">
          <button
            className="mb-btn-primary"
            type="button"
            onClick={() => {
              setMessage("");
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Tambah tujuan</span>
          </button>
          {message && (
            <p className="text-[14px] text-[#3d4128]" role="status">
              {message}
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.form
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={submit}
            className="rounded-[24px] border border-[#0e0f0a]/12 bg-[#fefffa] p-7 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#0e0f0a]/10 pb-5">
              <h2 className="font-editorial text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
                Buat tujuan belajar baru
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup formulir tujuan"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#0e0f0a]/60 hover:bg-[#faf5f1] hover:text-[#0e0f0a] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="goal-title"
                  className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
                >
                  Tujuan
                </label>
                <input
                  id="goal-title"
                  name="title"
                  required
                  maxLength={160}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: memahami aljabar dasar"
                  className="mb-input"
                />
              </div>

              <div>
                <label
                  htmlFor="goal-target"
                  className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
                >
                  Ukuran keberhasilan
                </label>
                <input
                  id="goal-target"
                  name="targetMetric"
                  required
                  maxLength={240}
                  value={targetMetric}
                  onChange={(event) => setTargetMetric(event.target.value)}
                  placeholder="Contoh: menyelesaikan 20 soal"
                  className="mb-input"
                />
              </div>

              <div>
                <label
                  htmlFor="goal-deadline"
                  className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
                >
                  Batas waktu
                </label>
                <input
                  id="goal-deadline"
                  name="deadline"
                  required
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="mb-input"
                />
              </div>
            </div>

            {message && (
              <p
                className="mt-4 text-[14px] text-[#8c2817]"
                role="status"
              >
                {message}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                className="mb-btn-primary"
                disabled={pending}
                type="submit"
              >
                {pending ? "Menyimpan…" : "Simpan tujuan"}
              </button>
              <button
                className="mb-btn-outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Batal
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
