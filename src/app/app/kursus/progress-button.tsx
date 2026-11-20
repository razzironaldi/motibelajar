"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ProgressButton({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );

  async function complete() {
    setState("saving");
    const response = await fetch("/api/lms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    setState(response.ok ? "done" : "error");
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer disabled:cursor-default ${
        state === "done"
          ? "bg-[#e1f079] text-[#0e0f0a]"
          : state === "error"
          ? "border border-[#e7573d] text-[#8c2817] hover:bg-[#e7573d]/10"
          : "border border-[#0e0f0a]/20 text-[#0e0f0a] hover:bg-[#faf5f1]"
      }`}
      disabled={state === "saving" || state === "done"}
      onClick={complete}
    >
      {state === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
      <span>
        {state === "done"
          ? "Selesai"
          : state === "saving"
          ? "Menyimpan…"
          : state === "error"
          ? "Coba lagi"
          : "Tandai selesai"}
      </span>
    </button>
  );
}
