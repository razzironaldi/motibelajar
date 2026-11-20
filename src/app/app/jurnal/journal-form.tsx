"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, PencilLine, Save, X } from "lucide-react";

type Entry = {
  id: string;
  title: string;
  body: string;
  visibility: string;
  updated_at: string;
};

export default function JournalForm({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function edit(entry: Entry) {
    setEditing(entry.id);
    setTitle(entry.title);
    setBody(entry.body);
    setMessage("");
  }

  function cancelEdit() {
    setEditing(null);
    setTitle("");
    setBody("");
    setMessage("");
  }

  async function save() {
    if (!title.trim() || !body.trim()) {
      setMessage("Isi judul dan catatan jurnal terlebih dahulu.");
      return;
    }
    setPending(true);
    setMessage("");
    const response = await fetch("/api/journal", {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...(editing ? { id: editing } : {}), title, body }),
    });
    setPending(false);
    setMessage(response.ok ? "Jurnal tersimpan." : "Jurnal gagal disimpan.");
    if (response.ok) {
      setTitle("");
      setBody("");
      setEditing(null);
      router.refresh();
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Soft Linen Composer */}
      <section className="h-fit rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-8 lg:col-span-5">
        <div className="flex items-center justify-between gap-3 border-b border-[#0e0f0a]/10 pb-4">
          <h2 className="font-editorial text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
            {editing ? "Revisi jurnal" : "Entri baru"}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 text-[13px] text-[#0e0f0a]/65 hover:text-[#0e0f0a] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Batal
            </button>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="journal-title"
              className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
            >
              Judul
            </label>
            <input
              id="journal-title"
              aria-label="Judul"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Catatan latihan pecahan hari ini"
              className="mb-input"
            />
          </div>

          <div>
            <label
              htmlFor="journal-body"
              className="mb-2 block text-[14px] font-medium text-[#0e0f0a]"
            >
              Isi jurnal
            </label>
            <textarea
              id="journal-body"
              aria-label="Isi jurnal"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Apa yang dipelajari hari ini? Bagian mana yang terasa lancar atau menantang?"
              rows={8}
              className="mb-input resize-y"
            />
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="mb-btn-primary"
          >
            <Save className="h-4 w-4" />
            <span>{pending ? "Menyimpan…" : "Simpan catatan"}</span>
          </button>

          {message && (
            <p role="status" className="text-[14px] text-[#3d4128]">
              {message}
            </p>
          )}
        </div>
      </section>

      {/* Right Entries Column */}
      <section className="space-y-4 lg:col-span-7">
        {entries.length ? (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] p-7 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#0e0f0a]/8 pb-4">
                <div>
                  <p className="text-[12px] text-[#0e0f0a]/55">
                    {entry.visibility === "private" ? "Privat" : entry.visibility}
                    {entry.updated_at ? (
                      <>
                        {" · "}
                        {new Date(entry.updated_at).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </>
                    ) : null}
                  </p>
                  <h2 className="font-editorial mt-1.5 text-[26px] leading-tight tracking-[-0.025em] text-[#0e0f0a]">
                    {entry.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => edit(entry)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#0e0f0a]/15 px-3 py-1.5 text-[13px] font-medium text-[#0e0f0a] transition-colors hover:bg-[#faf5f1] cursor-pointer"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Revisi
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.65] text-[#0e0f0a]/80">
                {entry.body}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-[#0e0f0a]/10 bg-[#fefffa] px-8 py-14 text-center">
            <BookMarked
              className="mx-auto h-6 w-6 text-[#3d4128]"
              strokeWidth={1.6}
            />
            <h2 className="font-editorial mt-4 text-[26px] tracking-[-0.03em] text-[#0e0f0a]">
              Belum ada jurnal
            </h2>
            <p className="mt-2 text-[15px] text-[#0e0f0a]/65">
              Mulai catat proses belajarmu di kolom sebelah kiri.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
