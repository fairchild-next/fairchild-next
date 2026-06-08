"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Member = {
  id: string;
  user_id: string;
  member_id: string;
  membership_type: string;
  display_name: string | null;
  expires_at: string;
  email: string | null;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso + (iso.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function StaffMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { members: Member[] };
        setMembers(d.members ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveDisplayName(id: string) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: editName.trim() || null }),
      });
      if (res.ok) {
        const d = await res.json() as { member: Member };
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, display_name: d.member.display_name } : m)));
        setEditingId(null);
      }
    } finally {
      setSaving(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.email?.toLowerCase().includes(q) ||
        m.member_id.toLowerCase().includes(q) ||
        m.display_name?.toLowerCase().includes(q)
    );
  }, [members, search]);

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/more" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition"><IconBack /></Link>
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Members</p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <div className="rounded-2xl px-4 py-3 text-sm text-[var(--text-muted)]"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          View-only member list. You can update display names shown on membership cards. Membership IDs and expiry come from your membership system.
        </div>

        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email, name, or member ID"
          className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }} />

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />)}</div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] py-8">No members found.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((m) => (
              <div key={m.id} className="rounded-2xl p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-primary)] truncate">{m.email ?? "No email"}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">ID {m.member_id} · {m.membership_type}</p>
                    <p className="text-xs text-[var(--text-muted)]">Expires {formatDate(m.expires_at)}</p>
                  </div>
                </div>
                {editingId === m.id ? (
                  <div className="flex gap-2">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Display name"
                      className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                    <button onClick={() => saveDisplayName(m.id)} disabled={saving === m.id}
                      className="px-3 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--primary)" }}>
                      {saving === m.id ? "…" : "Save"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-2 rounded-xl text-sm text-[var(--text-muted)]">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-[var(--text-primary)]">
                      Card name: <span className="font-medium">{m.display_name ?? "—"}</span>
                    </p>
                    <button onClick={() => { setEditingId(m.id); setEditName(m.display_name ?? ""); }}
                      className="text-xs font-semibold text-[var(--primary)] shrink-0">Edit name</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
