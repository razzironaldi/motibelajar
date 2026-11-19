"use client";

import { useState } from "react";

type Question = { id: string; prompt: string; dimension: string; order_no: number };
export default function MotivationForm({ versionId, questions }: { versionId: string; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit() { if (Object.keys(answers).length !== questions.length) return setMessage("Jawab semua pernyataan terlebih dahulu."); setPending(true); const response = await fetch("/api/motivation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ versionId, answers: questions.map((question) => ({ questionId: question.id, value: answers[question.id] })) }) }); const result = await response.json(); setPending(false); setMessage(response.ok ? "Refleksi tersimpan." : result.error?.code === "submit_failed" ? "Refleksi belum dapat disimpan." : "Periksa jawabanmu."); }
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><ol className="space-y-5">{questions.map((question, index) => <li key={question.id}><p className="font-medium text-slate-900">{index + 1}. {question.prompt}</p><div className="mt-3 grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((value) => <label key={value} className={`cursor-pointer rounded-xl border p-2 text-center text-sm ${answers[question.id] === value ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200"}`}><input className="sr-only" type="radio" name={question.id} value={value} checked={answers[question.id] === value} onChange={() => setAnswers((current) => ({ ...current, [question.id]: value }))} />{value}</label>)}</div></li>)}</ol><button onClick={submit} disabled={pending} className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{pending ? "Menyimpan…" : "Simpan refleksi"}</button>{message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}</section>;
}
