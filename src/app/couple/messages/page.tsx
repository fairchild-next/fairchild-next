"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WeddingMessage } from "@/lib/couple/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function formatMessageTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
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
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => setMyId(data.user?.id ?? null));
    load();
    // Poll every 30s while tab is focused
    const interval = setInterval(() => {
      if (!document.hidden) load();
    }, 30_000);
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
    if (res.ok) {
      setDraft("");
      await load();
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
      <h1 className="font-serif text-3xl text-stone-700 mb-4">Messages</h1>

      {/* Thread */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-3"
        style={{ background: "#fff", border: "1px solid #e8dfd0" }}
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-stone-400 text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === myId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                  ${isMine
                    ? "rounded-br-sm bg-amber-600 text-white"
                    : "rounded-bl-sm text-stone-700"
                  }
                `}
                style={!isMine ? { background: "#fdf6e3", border: "1px solid #e8dfd0" } : undefined}
              >
                {!isMine && (
                  <p className="text-xs text-stone-400 mb-1 font-medium uppercase tracking-wide">Coordinator</p>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
              <p className="text-xs text-stone-400 mt-1 px-1">{formatMessageTime(msg.created_at)}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <form onSubmit={send} className="flex gap-2 mt-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Write a message to your coordinator…"
          className="flex-1 rounded-xl px-3 py-2 text-sm text-stone-700 resize-none outline-none focus:ring-2 focus:ring-amber-300"
          style={{ border: "1px solid #e8dfd0", background: "#fff" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e as unknown as React.FormEvent);
            }
          }}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="self-end px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
