"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StaffMember = {
  id: string;
  user_id: string;
  email: string | null;
  created_at: string;
};

type Coordinator = {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  is_active: boolean;
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

function IconRing() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M8.5 3.5 A7 7 0 0 0 5 12" />
      <path d="M15.5 3.5 A7 7 0 0 1 19 12" />
      <path d="M5 12 A7 7 0 0 0 12 19" />
      <path d="M19 12 A7 7 0 0 1 12 19" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function StaffTeamPage() {
  // ── Staff state ─────────────────────────────────────────────────────────────
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // ── Coordinator state ────────────────────────────────────────────────────────
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [coordLoading, setCoordLoading] = useState(true);
  const [showAddCoord, setShowAddCoord] = useState(false);
  const [newCoordEmail, setNewCoordEmail] = useState("");
  const [newCoordName, setNewCoordName] = useState("");
  const [addingCoord, setAddingCoord] = useState(false);
  const [addCoordError, setAddCoordError] = useState<string | null>(null);
  const [addCoordSuccess, setAddCoordSuccess] = useState<string | null>(null);
  const [confirmRemoveCoordId, setConfirmRemoveCoordId] = useState<string | null>(null);
  const [removingCoord, setRemovingCoord] = useState<string | null>(null);

  useEffect(() => {
    void loadMembers();
    void loadCoordinators();
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

  async function loadCoordinators() {
    setCoordLoading(true);
    try {
      const res = await fetch("/api/admin/coordinators", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { coordinators: Coordinator[] };
        setCoordinators(d.coordinators ?? []);
      }
    } finally {
      setCoordLoading(false);
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

  async function handleAddCoord() {
    const email = newCoordEmail.trim().toLowerCase();
    if (!email) return;
    setAddingCoord(true);
    setAddCoordError(null);
    setAddCoordSuccess(null);
    try {
      const res = await fetch("/api/admin/coordinators", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: newCoordName.trim() || undefined }),
      });
      const d = await res.json() as { coordinator?: Coordinator; error?: string };
      if (res.ok && d.coordinator) {
        setCoordinators((prev) => [...prev, d.coordinator!]);
        setNewCoordEmail("");
        setNewCoordName("");
        setShowAddCoord(false);
        setAddCoordSuccess(`${email} added as coordinator.`);
        setTimeout(() => setAddCoordSuccess(null), 4000);
      } else {
        setAddCoordError(d.error ?? "Something went wrong.");
      }
    } finally {
      setAddingCoord(false);
    }
  }

  async function handleRemoveCoord(id: string) {
    setRemovingCoord(id);
    try {
      const res = await fetch(`/api/admin/coordinators/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCoordinators((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setRemovingCoord(null);
      setConfirmRemoveCoordId(null);
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

      <div className="px-5 space-y-8">

        {/* ── Staff section ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <p className="text-base font-bold text-[var(--text-primary)]">Staff Members</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Staff can access the Scanner, Map Editor, and this portal. They must already have an account.
            </p>
          </div>

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
              {addError && <p className="text-sm font-medium text-red-600">{addError}</p>}
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
            <div className="rounded-2xl px-5 py-3 text-sm font-semibold" style={{ background: "#d4e8d0", color: "#193521" }}>
              {addSuccess}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-[var(--text-muted)] text-sm">No staff members yet.</div>
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
                        <button onClick={() => setConfirmRemoveId(null)} className="text-sm text-[var(--text-muted)]">
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
                        <p className="text-[15px] font-bold text-[var(--text-primary)] truncate">{member.email ?? "Unknown"}</p>
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

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div style={{ height: 1, background: "var(--surface-border)" }} />

        {/* ── Wedding Coordinators section ──────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <p className="text-base font-bold text-[var(--text-primary)]">Wedding Coordinators</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Coordinators access the Wedding Portal to manage bookings, checklists, messages, and documents.
              They are separate from general staff — Fairchild employees who do both need an entry in each list.
            </p>
          </div>

          {showAddCoord ? (
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <p className="text-[15px] font-bold text-[var(--text-primary)]">Add wedding coordinator</p>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Email address</label>
                <input
                  type="email"
                  value={newCoordEmail}
                  onChange={(e) => setNewCoordEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCoord()}
                  placeholder="coordinator@example.com"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Display name <span className="font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={newCoordName}
                  onChange={(e) => setNewCoordName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
                />
              </div>
              {addCoordError && <p className="text-sm font-medium text-red-600">{addCoordError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleAddCoord}
                  disabled={!newCoordEmail.trim() || addingCoord}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
                  style={{ background: "#5c4a2a" }}
                >
                  {addingCoord ? "Adding…" : "Add Coordinator"}
                </button>
                <button
                  onClick={() => { setShowAddCoord(false); setNewCoordEmail(""); setNewCoordName(""); setAddCoordError(null); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] transition"
                  style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCoord(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-opacity active:opacity-70"
              style={{ background: "#5c4a2a", color: "#fff" }}
            >
              <IconPlus />
              Add Wedding Coordinator
            </button>
          )}

          {addCoordSuccess && (
            <div className="rounded-2xl px-5 py-3 text-sm font-semibold" style={{ background: "#d4e8d0", color: "#193521" }}>
              {addCoordSuccess}
            </div>
          )}

          {coordLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
              ))}
            </div>
          ) : coordinators.length === 0 ? (
            <div className="py-8 text-center text-[var(--text-muted)] text-sm">No wedding coordinators yet.</div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1">
                {coordinators.length} Coordinator{coordinators.length !== 1 ? "s" : ""}
              </p>
              {coordinators.map((coord) => (
                <div key={coord.id}>
                  {confirmRemoveCoordId === coord.id ? (
                    <div
                      className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                      style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
                    >
                      <p className="text-sm font-medium text-red-700">Remove {coord.email}?</p>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleRemoveCoord(coord.id)}
                          disabled={removingCoord === coord.id}
                          className="text-sm font-bold text-red-600 disabled:opacity-50"
                        >
                          {removingCoord === coord.id ? "Removing…" : "Remove"}
                        </button>
                        <button onClick={() => setConfirmRemoveCoordId(null)} className="text-sm text-[var(--text-muted)]">
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
                        style={{ background: "#f5ede0", color: "#5c4a2a" }}
                      >
                        <IconRing />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-[var(--text-primary)] truncate">
                          {coord.name ?? coord.email ?? "Unknown"}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {coord.name ? coord.email + " · " : ""}
                          Added {formatDate(coord.created_at)}
                          {!coord.is_active && <span className="ml-2 text-amber-600 font-medium">Inactive</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => setConfirmRemoveCoordId(coord.id)}
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
    </div>
  );
}
