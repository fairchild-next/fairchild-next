"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { WeddingDocument } from "@/lib/couple/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const CATEGORY_LABELS: Record<string, string> = {
  contract:    "Contract",
  floor_plan:  "Floor Plan",
  menu:        "Menu",
  inspiration: "Inspiration",
  other:       "Other",
};

const CATEGORY_EMOJI: Record<string, string> = {
  contract:    "📝",
  floor_plan:  "🗺️",
  menu:        "🍽️",
  inspiration: "✨",
  other:       "📎",
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
    const { error: uploadError } = await supabase.storage
      .from("wedding-docs")
      .upload(path, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("wedding-docs")
      .getPublicUrl(path);

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
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  const byCategory = Object.keys(CATEGORY_LABELS).reduce<Record<string, WeddingDocument[]>>((acc, cat) => {
    acc[cat] = documents.filter((d) => d.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-700 mb-1">Documents</h1>
        <p className="text-stone-400 text-sm">
          View files shared by your coordinator, or upload your own inspiration and materials.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8dfd0" }}>
        <h2 className="font-serif text-stone-600 text-base mb-3">Upload a File</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm text-stone-600 outline-none focus:ring-2 focus:ring-amber-300"
            style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
            ${uploading ? "bg-stone-100 text-stone-400" : "bg-amber-600 text-white hover:bg-amber-700"}
          `}>
            {uploading ? "Uploading…" : "Choose File"}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
              className="sr-only"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "#fff", border: "1px solid #e8dfd0" }}
        >
          <p className="text-4xl mb-3">📄</p>
          <p className="text-stone-400 text-sm">No documents yet. Your coordinator will share files as they're ready.</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, docs]) => {
          if (docs.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="font-serif text-stone-600 text-base mb-2">
                {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
              </h2>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                    style={{ background: "#fff", border: "1px solid #e8dfd0" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{CATEGORY_EMOJI[doc.category]}</span>
                      <div className="min-w-0">
                        <p className="text-stone-700 text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-stone-400 text-xs">
                          {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 text-xs hover:underline"
                      >
                        View
                      </a>
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        className="text-stone-300 hover:text-red-400 text-xs transition-colors"
                        aria-label="Delete document"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
