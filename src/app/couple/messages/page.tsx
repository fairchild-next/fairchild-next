"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WeddingMessage } from "@/lib/couple/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function timeAgo(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<WeddingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/couple/messages");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) =>
      setMyId(data.user?.id ?? null)
    );
    load();
    const interval = setInterval(() => { if (!document.hidden) load(); }, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    const res = await fetch("/api/couple/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: draft }),
    });
    if (res.ok) { setDraft(""); await load(); }
    setSending(false);
  }

  return (
    <div className="flex flex-col" style={{ background: "#f0f3ee", height: "100%" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: "#9aab9a" }}>Your coordinator team</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm p-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#e8efe6" }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#5a6e5a" }}>No messages yet</p>
            <p className="text-sm mt-1" style={{ color: "#9aab9a" }}>Send a note to your coordinator to get started.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === myId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              {!isMine && (
                <p className="text-xs font-semibold mb-1 px-1 uppercase tracking-wider" style={{ color: "#9aab9a" }}>
                  Fairchild Events Team
                </p>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={
                  isMine
                    ? { background: "#4a6741", color: "#fff", borderBottomRightRadius: 4 }
                    : { background: "#fff", color: "#2a3d2a", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }
                }
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
              <p className="text-xs mt-1 px-1" style={{ color: "#b4c4b4" }}>{timeAgo(msg.created_at)}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <form
        onSubmit={send}
        className="shrink-0 flex gap-2 px-4 py-3"
        style={{ background: "#fff", borderTop: "1px solid #e4ebe4" }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Write a message…"
          className="flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none"
          style={{ border: "1.5px solid #e4ebe4", background: "#f7faf7", color: "#2a3d2a" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as unknown as React.FormEvent); }
          }}
        />
        <button
          type="submit" disabled={sending || !draft.trim()}
          className="self-end w-10 h-10 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
          style={{ background: "#4a6741" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
