"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StaffMember = {
  id: string;
  user_id: string;
  email: string | null;
  created_at: string;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function StaffTeamPage() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    void loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/users", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { members: StaffMember[] };
        setMembers(d.members ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const res = await fetch("/api/staff/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await res.json() as { member?: StaffMember; error?: string };
      if (res.ok && d.member) {
        setMembers((prev) => [...prev, d.member!]);
        setNewEmail("");
        setShowAdd(false);
        setAddSuccess(`${email} added to staff.`);
        setTimeout(() => setAddSuccess(null), 4000);
      } else {
        setAddError(d.error ?? "Something went wrong.");
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      const res = await fetch(`/api/staff/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } finally {
      setRemoving(null);
      setConfirmRemoveId(null);
    }
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
          <IconBack />
        </Link>
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Manage Team</p>
        </div>
      </div>

      <div className="px-5 space-y-5">

        {/* Explanation card */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
        >
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Staff members can access the Scanner, Map Editor, and this portal. They must already have an account — add them by their registered email address.
          </p>
        </div>

        {/* Add form */}
        {showAdd ? (
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            <p className="text-[15px] font-bold text-[var(--text-primary)]">Add staff member</p>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Email address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="staff@fairchildgarden.org"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
              />
            </div>
            {addError && (
              <p className="text-sm font-medium text-red-600">{addError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={!newEmail.trim() || adding}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
                style={{ background: "var(--primary)" }}
              >
                {adding ? "Adding…" : "Add to Staff"}
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewEmail(""); setAddError(null); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] transition"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-opacity active:opacity-70"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <IconPlus />
            Add Staff Member
          </button>
        )}

        {addSuccess && (
          <div
            className="rounded-2xl px-5 py-3 text-sm font-semibold"
            style={{ background: "#d4e8d0", color: "#193521" }}
          >
            {addSuccess}
          </div>
        )}

        {/* Staff list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-muted)] text-sm">
            No staff members yet.
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1">
              {members.length} Staff Member{members.length !== 1 ? "s" : ""}
            </p>
            {members.map((member) => (
              <div key={member.id}>
                {confirmRemoveId === member.id ? (
                  <div
                    className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                    style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
                  >
                    <p className="text-sm font-medium text-red-700">Remove {member.email}?</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={removing === member.id}
                        className="text-sm font-bold text-red-600 disabled:opacity-50"
                      >
                        {removing === member.id ? "Removing…" : "Remove"}
                      </button>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="text-sm text-[var(--text-muted)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl px-5 py-4 flex items-center gap-3"
                    style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--background)", color: "var(--primary)" }}
                    >
                      <IconPerson />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-[var(--text-primary)] truncate">
                        {member.email ?? "Unknown"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Added {formatDate(member.created_at)}</p>
                    </div>
                    <button
                      onClick={() => setConfirmRemoveId(member.id)}
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 transition px-1"
                    >
                      Remove
                    </button>
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
