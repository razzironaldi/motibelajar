"use client";

import { useEffect, useState } from "react";

type Question = {
  question_id: string;
  prompt: string;
  type: string;
  dimension: string | null;
  order_no: number;
  option_id: string | null;
  option_label: string | null;
};

export default function AssessmentForm({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState("Memuat pertanyaan…");

  useEffect(() => {
    fetch(`/api/assessment?assignmentId=${assignmentId}`)
      .then((r) => r.json())
      .then((body) => {
        if (Array.isArray(body.data)) {
          setQuestions(body.data);
          setState("");
        } else {
          setState("Assessment tidak tersedia.");
        }
      })
      .catch(() => setState("Assessment tidak tersedia."));
  }, [assignmentId]);

  const grouped = questions.reduce<Record<string, Question[]>>((all, item) => {
    (all[item.question_id] ??= []).push(item);
    return all;
  }, {});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("Mengirim…");
    const response = await fetch("/api/assessment", {
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
    setState(
      response.ok
        ? "Jawaban tersimpan."
        : "Jawaban belum tersimpan. Coba lagi."
    );
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={submit}>
      {state && (
        <p className="text-[14px] text-[#3d4128]" role="status">
          {state}
        </p>
      )}
      {Object.values(grouped).map((options, idx) => (
        <fieldset
          className="rounded-[18px] border border-[#0e0f0a]/10 bg-[#faf5f1] p-5"
          key={options[0].question_id}
        >
          <legend className="text-[15px] font-medium text-[#0e0f0a]">
            <span className="tabular-nums mr-2 text-[#3d4128]">{idx + 1}.</span>
            {options[0].prompt}
          </legend>
          <div className="mt-4 space-y-2.5">
            {options
              .filter((option) => option.option_id)
              .map((option) => {
                const chosen = answers[option.question_id] === option.option_id;
                return (
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-[14px] transition-colors ${
                      chosen
                        ? "border-[#3d4128] bg-[#fefffa] text-[#0e0f0a]"
                        : "border-[#0e0f0a]/10 bg-[#fefffa]/70 text-[#0e0f0a]/82 hover:border-[#0e0f0a]/30"
                    }`}
                    key={option.option_id}
                  >
                    <input
                      required
                      type="radio"
                      name={option.question_id}
                      value={option.option_id ?? ""}
                      checked={chosen}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [option.question_id]: event.target.value,
                        }))
                      }
                      className="h-4 w-4 accent-[#3d4128]"
                    />
                    <span>{option.option_label}</span>
                  </label>
                );
              })}
          </div>
        </fieldset>
      ))}
      {questions.length > 0 && (
        <button className="mb-btn-primary" type="submit">
          Kirim jawaban
        </button>
      )}
    </form>
  );
}
