"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { WeddingDocument } from "@/lib/couple/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const CATEGORY_LABELS: Record<string, string> = {
  contract: "Contract", floor_plan: "Floor Plan", menu: "Menu", inspiration: "Inspiration", other: "Other",
};
const CATEGORY_EMOJI: Record<string, string> = {
  contract: "📝", floor_plan: "🗺️", menu: "🍽️", inspiration: "✨", other: "📎",
};
const CATEGORY_COLOR: Record<string, string> = {
  contract: "#e8efe6", floor_plan: "#e8f0f8", menu: "#fdf6e3", inspiration: "#f8e8f0", other: "#f0f3ee",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<WeddingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<string>("other");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/couple/documents");
    const data = await res.json();
    setDocuments(data.documents ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    const path = `uploads/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("wedding-docs").upload(path, file);
    if (uploadError) { alert("Upload failed: " + uploadError.message); setUploading(false); if (fileRef.current) fileRef.current.value = ""; return; }
    const { data: { publicUrl } } = supabase.storage.from("wedding-docs").getPublicUrl(path);
    await fetch("/api/couple/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: file.name, file_url: publicUrl, category }),
    });
    await load();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function deleteDoc(id: string) {
    if (!confirm("Remove this document?")) return;
    await fetch(`/api/couple/documents?docId=${id}`, { method: "DELETE" });
    setDocuments((p) => p.filter((d) => d.id !== id));
  }

  const byCategory = Object.keys(CATEGORY_LABELS).reduce<Record<string, WeddingDocument[]>>((acc, cat) => {
    acc[cat] = documents.filter((d) => d.category === cat);
    return acc;
  }, {});

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Documents</h1>
        <p className="text-sm mt-0.5" style={{ color: "#9aab9a" }}>Files shared by your coordinator &amp; your uploads</p>
      </div>

      {/* Upload card */}
      <div className="mx-4 mb-3 rounded-2xl bg-white shadow-sm p-4">
        <p className="font-serif text-sm font-semibold mb-3" style={{ color: "#4a6741" }}>Upload a File</p>
        <div className="flex gap-2 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: "1.5px solid #e4ebe4", background: "#f7faf7", color: "#2a3d2a" }}
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-opacity"
            style={uploading
              ? { background: "#e4ebe4", color: "#9aab9a" }
              : { background: "#4a6741", color: "#fff" }}
          >
            {uploading ? "Uploading…" : "Choose File"}
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" disabled={uploading} onChange={handleUpload} />
          </label>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && documents.length === 0 && (
        <div className="mx-4 rounded-2xl bg-white shadow-sm p-8 text-center">
          <p className="text-3xl mb-2">📄</p>
          <p className="text-sm" style={{ color: "#9aab9a" }}>No documents yet. Your coordinator will share files as they're ready.</p>
        </div>
      )}

      <div className="px-4 space-y-4 pb-4">
        {Object.entries(byCategory).map(([cat, docs]) => {
          if (docs.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9aab9a" }}>
                {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
              </p>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl flex items-center gap-3 px-4 py-3 bg-white shadow-sm"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: CATEGORY_COLOR[doc.category] ?? "#f0f3ee" }}
                    >
                      {CATEGORY_EMOJI[doc.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#2a3d2a" }}>{doc.file_name}</p>
                      <p className="text-xs" style={{ color: "#9aab9a" }}>
                        {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                         className="text-xs font-semibold" style={{ color: "#4a6741" }}>
                        View
                      </a>
                      <button onClick={() => deleteDoc(doc.id)} className="text-[#c4d4c4] hover:text-red-400 transition-colors" aria-label="Delete">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div className="h-2" />
      </div>
    </div>
  );
}
