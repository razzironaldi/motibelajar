"use client";

import { useEffect, useState } from "react";

type Q = {
  question_id: string;
  prompt: string;
  option_id: string | null;
  option_label: string | null;
  order_no: number;
};

export default function QuizForm({ assignmentId }: { assignmentId: string }) {
  const [rows, setRows] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/lms/quiz?assignmentId=${assignmentId}`)
      .then((r) => r.json())
      .then((b) => setRows(Array.isArray(b.data) ? b.data : []))
      .catch(() => setMessage("Kuis belum tersedia."));
  }, [assignmentId]);

  const grouped = rows.reduce<Record<string, Q[]>>((all, q) => {
    (all[q.question_id] ??= []).push(q);
    return all;
  }, {});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/lms/quiz", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId,
          optionId,
        })),
      }),
    });
    setMessage(r.ok ? "Jawaban kuis tersimpan." : "Jawaban belum tersimpan.");
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      {message && (
        <p role="status" className="text-[14px] text-[#3d4128]">
          {message}
        </p>
      )}
      {Object.values(grouped).map((opts, idx) => (
        <fieldset
          className="rounded-[18px] border border-[#0e0f0a]/10 bg-[#faf5f1] p-5"
          key={opts[0].question_id}
        >
          <legend className="text-[15px] font-medium text-[#0e0f0a]">
            <span className="tabular-nums mr-2 text-[#3d4128]">{idx + 1}.</span>
            {opts[0].prompt}
          </legend>
          <div className="mt-4 space-y-2">
            {opts
              .filter((o) => o.option_id)
              .map((o) => {
                const chosen = answers[o.question_id] === o.option_id;
                return (
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-[14px] transition-colors ${
                      chosen
                        ? "border-[#3d4128] bg-[#fefffa] text-[#0e0f0a]"
                        : "border-[#0e0f0a]/10 bg-[#fefffa]/70 text-[#0e0f0a]/82 hover:border-[#0e0f0a]/30"
                    }`}
                    key={o.option_id}
                  >
                    <input
                      required
                      type="radio"
                      name={o.question_id}
                      value={o.option_id ?? ""}
                      checked={chosen}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          [o.question_id]: e.target.value,
                        }))
                      }
                      className="h-4 w-4 accent-[#3d4128]"
                    />
                    <span>{o.option_label}</span>
                  </label>
                );
              })}
          </div>
        </fieldset>
      ))}
      {rows.length > 0 && (
        <button className="mb-btn-primary" type="submit">
          Kirim kuis
        </button>
      )}
    </form>
  );
}
