"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Question = {
  id: string;
  prompt: string;
  dimension: string;
  order_no: number;
};

const SCALE_LABELS = [
  { value: 1, text: "1 · Sangat jarang" },
  { value: 2, text: "2 · Jarang" },
  { value: 3, text: "3 · Sering" },
  { value: 4, text: "4 · Sangat sering" },
];

export default function MotivationForm({
  versionId,
  questions,
}: {
  versionId: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const answeredCount = Object.keys(answers).length;

  async function submit() {
    if (answeredCount !== questions.length) {
      return setMessage("Jawab semua pernyataan terlebih dahulu.");
    }
    setPending(true);
    setMessage("");
    const response = await fetch("/api/motivation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        versionId,
        answers: questions.map((question) => ({
          questionId: question.id,
          value: answers[question.id],
        })),
      }),
    });
    const result = await response.json();
    setPending(false);
    setMessage(
      response.ok
        ? "Refleksi tersimpan."
        : result.error?.code === "submit_failed"
        ? "Refleksi belum dapat disimpan."
        : "Periksa jawabanmu."
    );
  }

  return (
    <section className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0e0f0a]/10 pb-5">
        <p className="text-[14px] text-[#0e0f0a]/68">
          Pilih angka yang paling menggambarkan perasaanmu belakangan ini.
        </p>
        <span className="tabular-nums text-[14px] font-medium text-[#3d4128]">
          {answeredCount}/{questions.length} terjawab
        </span>
      </div>

      <ol className="mt-6 divide-y divide-[#0e0f0a]/10">
        {questions.map((question, index) => (
          <li key={question.id} className="py-6 first:pt-2">
            <p className="text-[16px] font-medium leading-snug text-[#0e0f0a]">
              <span className="tabular-nums mr-2 text-[#3d4128]">
                {index + 1}.
              </span>
              {question.prompt}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {SCALE_LABELS.map((item) => {
                const selected = answers[question.id] === item.value;
                return (
                  <label
                    key={item.value}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-3 py-3 text-center text-[13px] font-medium transition-colors ${
                      selected
                        ? "border-[#3d4128] bg-[#3d4128] text-[#e1f079]"
                        : "border-[#0e0f0a]/15 bg-[#faf5f1] text-[#0e0f0a] hover:border-[#0e0f0a]/40"
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name={question.id}
                      value={item.value}
                      checked={selected}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: item.value,
                        }))
                      }
                    />
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span>{item.text}</span>
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#0e0f0a]/10 pt-6">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="mb-btn-primary"
        >
          {pending ? "Menyimpan…" : "Simpan refleksi"}
        </button>
        {message && (
          <p role="status" className="text-[14px] text-[#3d4128]">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
