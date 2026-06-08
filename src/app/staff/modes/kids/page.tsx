"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

type QuestItem = {
  id: string;
  name: string;
  hint: string;
  image_url: string | null;
  quest_type: string | null;
  zone: string | null;
  name_color: string | null;
  sort_order: number;
  is_active: boolean;
};

type Badge = {
  id: string;
  badge_key: string;
  badge_name: string;
  description: string;
  icon_url: string | null;
  badge_type: string;
  sort_order: number;
};

type Tab = "quest" | "badges";

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

const BADGE_TYPE_COLORS: Record<string, string> = {
  discovery:  "bg-[#d4e8d0] text-[#193521]",
  completion: "bg-blue-100 text-blue-700",
  creativity: "bg-purple-100 text-purple-700",
  secret:     "bg-amber-100 text-amber-700",
};

// ── Quest Items Tab ──────────────────────────────────────────────────────────

function QuestTab() {
  const [items, setItems] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHint, setNewHint] = useState("");
  const [newType, setNewType] = useState("");
  const [newZone, setNewZone] = useState("");
  const [newColor, setNewColor] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editHint, setEditHint] = useState("");
  const [editType, setEditType] = useState("");
  const [editZone, setEditZone] = useState("");
  const [editColor, setEditColor] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quest-items", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { items: QuestItem[] };
        setItems(d.items ?? []);
      }
    } finally { setLoading(false); }
  }

  async function toggle(item: QuestItem) {
    setToggling(item.id);
    try {
      const res = await fetch(`/api/admin/quest-items/${item.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      if (res.ok) setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
    } finally { setToggling(null); }
  }

  function startEdit(item: QuestItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditHint(item.hint);
    setEditType(item.quest_type ?? "");
    setEditZone(item.zone ?? "");
    setEditColor(item.name_color ?? "");
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/quest-items/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, hint: editHint, quest_type: editType || null, zone: editZone || null, name_color: editColor || null }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, name: editName, hint: editHint, quest_type: editType || null, zone: editZone || null, name_color: editColor || null } : i));
        setEditingId(null);
      }
    } finally { setSavingEdit(false); }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/quest-items", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, hint: newHint, quest_type: newType || null, zone: newZone || null, name_color: newColor || null }),
      });
      const d = await res.json() as { item?: QuestItem };
      if (res.ok && d.item) {
        setItems((prev) => [...prev, d.item!]);
        setShowNew(false);
        setNewName(""); setNewHint(""); setNewType(""); setNewZone(""); setNewColor("");
      }
    } finally { setCreating(false); }
  }

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm focus:outline-none";
  const inputSty = { background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" } as React.CSSProperties;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Items kids find during the Garden Quest scavenger hunt.</p>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
          style={{ background: "var(--primary)" }}>
          <IconPlus /> Add Item
        </button>
      </div>

      {/* New item form */}
      {showNew && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <p className="text-sm font-bold text-[var(--text-primary)]">New Quest Item</p>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='e.g. "yellow butterfly"' autoFocus className={inputCls} style={inputSty} />
          <input type="text" value={newHint} onChange={(e) => setNewHint(e.target.value)} placeholder="Hint for kids (where to find it)" className={inputCls} style={inputSty} />
          <div className="grid grid-cols-3 gap-2">
            <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="Type (butterfly…)" className={inputCls} style={inputSty} />
            <input type="text" value={newZone} onChange={(e) => setNewZone(e.target.value)} placeholder="Zone (pavilion…)" className={inputCls} style={inputSty} />
            <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Color word (blue)" className={inputCls} style={inputSty} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim() || creating}
              className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "var(--primary)" }}>{creating ? "Adding…" : "Add Item"}</button>
            <button onClick={() => setShowNew(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)]"
              style={{ border: "1px solid var(--surface-border)" }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />)}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", opacity: item.is_active ? 1 : 0.55 }}>
              {editingId === item.id ? (
                <div className="p-4 space-y-3">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} style={inputSty} />
                  <input type="text" value={editHint} onChange={(e) => setEditHint(e.target.value)} placeholder="Hint" className={inputCls} style={inputSty} />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={editType} onChange={(e) => setEditType(e.target.value)} placeholder="Type" className={inputCls} style={inputSty} />
                    <input type="text" value={editZone} onChange={(e) => setEditZone(e.target.value)} placeholder="Zone" className={inputCls} style={inputSty} />
                    <input type="text" value={editColor} onChange={(e) => setEditColor(e.target.value)} placeholder="Color" className={inputCls} style={inputSty} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(item.id)} disabled={savingEdit}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: "var(--primary)" }}>{savingEdit ? "Saving…" : "Save"}</button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)]"
                      style={{ border: "1px solid var(--surface-border)" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => toggle(item)} disabled={toggling === item.id}
                    className="shrink-0 w-10 h-6 rounded-full relative transition-colors disabled:opacity-50"
                    style={{ background: item.is_active ? "var(--primary)" : "var(--surface-border)" }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                      style={{ left: item.is_active ? "calc(100% - 22px)" : "2px" }} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{item.name}</p>
                    {item.hint && <p className="text-xs text-[var(--text-muted)] truncate">{item.hint}</p>}
                    {(item.quest_type || item.zone) && (
                      <p className="text-xs text-[var(--text-muted)]">{[item.quest_type, item.zone].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                  <button onClick={() => startEdit(item)} className="text-xs font-semibold text-[var(--primary)] px-2 py-1 rounded-lg shrink-0"
                    style={{ border: "1px solid var(--primary)" }}>Edit</button>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-6">No quest items yet.</p>}
        </div>
      )}
    </div>
  );
}

// ── Badges Tab ───────────────────────────────────────────────────────────────

function BadgesTab() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/badges", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { badges?: Badge[] };
        setBadges(d.badges ?? []);
      }
    } finally { setLoading(false); }
  }

  async function saveDesc(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/badges/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editDesc }),
      });
      if (res.ok) {
        setBadges((prev) => prev.map((b) => b.id === id ? { ...b, description: editDesc } : b));
        setEditingId(null);
      }
    } finally { setSaving(false); }
  }

  async function handleIconUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/badges/${id}`, { method: "POST", credentials: "include", body: form });
      const d = await res.json() as { icon_url?: string };
      if (d.icon_url) setBadges((prev) => prev.map((b) => b.id === id ? { ...b, icon_url: d.icon_url! } : b));
    } finally {
      setUploadingId(null);
      const ref = fileRefs.current[id];
      if (ref) ref.value = "";
    }
  }

  const inputSty = { background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" } as React.CSSProperties;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-muted)]">Upload badge artwork and update descriptions. Badge award logic lives in the code.</p>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />)}</div>
      ) : (
        <div className="space-y-2">
          {badges.map((badge) => (
            <div key={badge.id} className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
              <div className="flex items-center gap-3">
                {/* Badge icon */}
                <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-[var(--background)]">
                  {badge.icon_url ? (
                    <Image src={badge.icon_url} alt={badge.badge_name} fill className="object-contain p-1" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">🏅</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{badge.badge_name}</p>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_TYPE_COLORS[badge.badge_type] ?? "bg-gray-100 text-gray-600"}`}>
                      {badge.badge_type}
                    </span>
                  </div>
                  {editingId !== badge.id && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{badge.description}</p>
                  )}
                </div>
              </div>

              {/* Edit description */}
              {editingId === badge.id ? (
                <div className="space-y-2">
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none" style={inputSty} />
                  <div className="flex gap-2">
                    <button onClick={() => saveDesc(badge.id)} disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                      style={{ background: "var(--primary)" }}><IconCheck /> {saving ? "Saving…" : "Save"}</button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)]"
                      style={{ border: "1px solid var(--surface-border)" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(badge.id); setEditDesc(badge.description); }}
                    className="text-xs font-semibold text-[var(--primary)] px-2.5 py-1.5 rounded-lg"
                    style={{ border: "1px solid var(--primary)" }}>Edit Description</button>

                  <button onClick={() => fileRefs.current[badge.id]?.click()}
                    disabled={uploadingId === badge.id}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[var(--text-muted)] disabled:opacity-50"
                    style={{ border: "1px solid var(--surface-border)" }}>
                    <IconUpload /> {uploadingId === badge.id ? "Uploading…" : "Upload Icon"}
                  </button>
                  <input
                    type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    ref={(el) => { fileRefs.current[badge.id] = el; }}
                    onChange={(e) => handleIconUpload(badge.id, e)}
                  />
                </div>
              )}
            </div>
          ))}
          {badges.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-6">No badges found.</p>}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StaffKidsModeEditorPage() {
  const [tab, setTab] = useState<Tab>("quest");

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/more" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"><IconBack /></Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Kids Mode</p>
        </div>
        <Link href="/?preview=kids" target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl text-[var(--text-muted)]"
          style={{ border: "1px solid var(--surface-border)" }}>
          Preview <IconChevron />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-5 mb-5 p-1 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
        {(["quest", "badges"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-bold capitalize transition"
            style={{
              background: tab === t ? "var(--primary)" : "transparent",
              color: tab === t ? "white" : "var(--text-muted)",
            }}>
            {t === "quest" ? "Quest Items" : "Badges"}
          </button>
        ))}
      </div>

      <div className="px-5">
        {tab === "quest" ? <QuestTab /> : <BadgesTab />}
      </div>
    </div>
  );
}
