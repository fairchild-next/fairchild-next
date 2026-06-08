"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useKidsMode, type ChildProfile } from "@/lib/kidsModeContext";
import { useMember } from "@/lib/memberContext";

const EMOJI_OPTIONS = ["🌿", "🦋", "🌸", "🌺", "🐝", "🐢", "🦎", "🌱", "🍃", "🌻"];

export default function KidsProfilesPage() {
  const router = useRouter();
  const { member, hasSession } = useMember();
  const { setKidsMode, setActiveChild } = useKidsMode();

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState(EMOJI_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSession) {
      router.replace("/login?redirect=" + encodeURIComponent("/kids/profiles"));
      return;
    }
    void loadProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession]);

  async function loadProfiles() {
    setLoading(true);
    try {
      const res = await fetch("/api/kids/profiles", { credentials: "include" });
      if (res.ok) {
        const json = await res.json() as { profiles: ChildProfile[] };
        setProfiles(json.profiles ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  function selectChild(child: ChildProfile) {
    setActiveChild(child);
    setKidsMode(true);
    router.push("/");
  }

  function selectNoChild() {
    setActiveChild(null);
    setKidsMode(true);
    router.push("/");
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/kids/profiles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar_emoji: newEmoji }),
      });
      if (res.ok) {
        const json = await res.json() as { profile: ChildProfile };
        setProfiles((p) => [...p, json.profile]);
        setNewName("");
        setNewEmoji(EMOJI_OPTIONS[0]);
        setShowAdd(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/kids/profiles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setProfiles((p) => p.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-24 min-h-screen bg-[#F3EFEE]">
      <h1 className="text-2xl font-semibold text-[#193521] mb-1">Who&apos;s exploring today?</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Each explorer keeps their own badges and discoveries.
      </p>

      {/* Existing child profiles */}
      <div className="space-y-3 mb-6">
        {profiles.map((child) => (
          <div key={child.id} className="relative">
            {confirmDeleteId === child.id ? (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-red-300">
                <p className="text-sm font-medium text-[#193521]">
                  Remove {child.name}? Their badges and discoveries will be lost.
                </p>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <button
                    onClick={() => handleDelete(child.id)}
                    disabled={deletingId === child.id}
                    className="text-sm font-semibold text-red-500 disabled:opacity-50"
                  >
                    {deletingId === child.id ? "Removing…" : "Remove"}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-sm text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectChild(child)}
                  className="flex-1 flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-[#d4e8d0] hover:border-[#6A8468] active:scale-[0.98] transition text-left"
                >
                  <span className="text-3xl" aria-hidden>{child.avatar_emoji}</span>
                  <span className="text-lg font-semibold text-[#193521]">{child.name}</span>
                  <span className="ml-auto text-[#6A8468] font-semibold">Explore →</span>
                </button>
                <button
                  onClick={() => setConfirmDeleteId(child.id)}
                  className="p-2 text-[var(--text-muted)] hover:text-red-500 transition"
                  aria-label={`Remove ${child.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new explorer */}
      {showAdd ? (
        <div className="p-4 rounded-2xl bg-white border-2 border-[#d4e8d0] space-y-4 mb-6">
          <p className="font-semibold text-[#193521]">New explorer</p>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Emma"
              maxLength={40}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#6A8468]"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Pick an avatar</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition ${
                    newEmoji === emoji
                      ? "border-[#6A8468] bg-[#d4e8d0]"
                      : "border-[var(--surface-border)] bg-white"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || saving}
              className="flex-1 py-2.5 rounded-xl bg-[#193521] text-white text-sm font-semibold disabled:opacity-50 transition"
            >
              {saving ? "Saving…" : "Add Explorer"}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(""); }}
              className="px-4 py-2.5 rounded-xl border border-[var(--surface-border)] text-sm text-[var(--text-muted)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-[#6A8468]/40 text-[#6A8468] text-sm font-medium hover:border-[#6A8468] hover:bg-[#d4e8d0]/30 transition mb-6"
        >
          + Add a new explorer
        </button>
      )}

      {/* Divider */}
      {(member || profiles.length > 0) && (
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--surface-border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <div className="flex-1 h-px bg-[var(--surface-border)]" />
        </div>
      )}

      {/* Skip to adult Kids Mode */}
      <button
        onClick={selectNoChild}
        className="w-full p-4 rounded-2xl bg-white border border-[var(--surface-border)] hover:border-[#6A8468] text-sm font-medium text-[var(--text-primary)] transition"
      >
        Continue without a profile
      </button>
    </div>
  );
}
