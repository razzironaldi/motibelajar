"use client";

import { useState } from "react";

export default function ProgressButton({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  async function complete() {
    setState("saving");
    const response = await fetch("/api/lms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonId }) });
    setState(response.ok ? "done" : "error");
  }
  return <button className="text-sm font-semibold text-indigo-700 disabled:opacity-50" disabled={state === "saving" || state === "done"} onClick={complete}>{state === "done" ? "Selesai" : state === "saving" ? "Menyimpan…" : state === "error" ? "Coba lagi" : "Tandai selesai"}</button>;
}
