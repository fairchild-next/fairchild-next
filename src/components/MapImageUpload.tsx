"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function MapImageUpload({
  value,
  onChange,
  placeholder = "Photo URL or upload",
  className = "",
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const {
        data: { session },
      } = await createSupabaseBrowserClient().auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch("/api/map/upload", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: formData,
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded border border-[var(--surface-border)] bg-[var(--bg)] px-2 py-1 text-xs"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          className="hidden"
          disabled={disabled || uploading}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="shrink-0 rounded border border-[var(--surface-border)] px-2 py-1 text-xs hover:bg-[var(--surface)] disabled:opacity-50"
        >
          {uploading ? "…" : "Upload"}
        </button>
      </div>
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
