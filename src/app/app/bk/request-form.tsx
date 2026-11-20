"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function RequestForm() {
  const router = useRouter();
  const [category, setCategory] = useState("belajar");
  const [urgency, setUrgency] = useState("normal");
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "error" | "success">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setMessage("");
    try {
      const response = await fetch("/api/counseling/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category, urgency, reason }),
      });
      const result = (await response.json()) as { error?: { code?: string } };
      if (!response.ok) throw new Error(result.error?.code ?? "request_failed");
      setReason("");
      setState("success");
      setMessage("Permintaan konseling terkirim.");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error && error.message === "no_assigned_counselor"
          ? "Belum ada guru BK utama yang ditetapkan."
          : "Permintaan belum dapat dikirim."
      );
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-8"
    >
      <div className="border-b border-[#0e0f0a]/10 pb-5">
        <h2 className="font-editorial text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
          Ajukan sesi pendampingan
        </h2>
        <p className="mt-1.5 text-[14px] text-[#0e0f0a]/65">
          Hanya guru BK pendampingmu yang menerima permintaan ini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
          >
            Kategori
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mb-input"
          >
            <option value="belajar">Belajar</option>
            <option value="pribadi">Pribadi</option>
            <option value="sosial">Sosial</option>
            <option value="karier">Karier</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="urgency"
            className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
          >
            Prioritas
          </label>
          <select
            id="urgency"
            value={urgency}
            onChange={(event) => setUrgency(event.target.value)}
            className="mb-input"
          >
            <option value="normal">Normal</option>
            <option value="segera">Segera</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="reason"
          className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
        >
          Hal yang ingin dibicarakan
        </label>
        <textarea
          id="reason"
          required
          minLength={1}
          maxLength={2000}
          rows={5}
          placeholder="Ceritakan seperlunya tentang apa yang sedang kamu hadapi..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mb-input min-h-32 resize-y"
        />
      </div>

      <button
        disabled={state === "pending"}
        type="submit"
        className="mb-btn-primary"
      >
        <Send className="h-4 w-4" />
        <span>{state === "pending" ? "Mengirim…" : "Kirim permintaan"}</span>
      </button>

      {message && (
        <p
          role="status"
          className={`text-[14px] ${
            state === "error" ? "text-[#8c2817]" : "text-[#3d4128]"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
