"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { WeddingBooking, ChecklistItem, WeddingMessage, WeddingDocument } from "@/lib/couple/types";
import { formatDate, formatTime, STATUS_LABELS, STATUS_COLORS, daysUntil } from "@/lib/couple/types";
import type { BookingStatus } from "@/lib/couple/types";

const STATUSES: BookingStatus[] = ["inquiry", "contract_signed", "planning", "confirmed", "complete"];

const CATEGORY_LABELS: Record<string, string> = {
  contract: "Contract", floor_plan: "Floor Plan", menu: "Menu", inspiration: "Inspiration", other: "Other",
};

type Tab = "overview" | "checklist" | "messages" | "documents" | "settings";

export default function CoordinatorBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<WeddingBooking | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [messages, setMessages] = useState<WeddingMessage[]>([]);
  const [documents, setDocuments] = useState<WeddingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  // Editable booking fields
  const [editFields, setEditFields] = useState<Partial<WeddingBooking>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Checklist add form
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDue, setNewItemDue] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  // Message compose
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Link couple
  const [linkEmail, setLinkEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkResult, setLinkResult] = useState("");

  // Document upload
  const [docCategory, setDocCategory] = useState("other");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [bRes, cRes, mRes, dRes] = await Promise.all([
      fetch("/api/couple/booking"),
      fetch(`/api/couple/checklist?bookingId=${bookingId}`),
      fetch(`/api/couple/messages?bookingId=${bookingId}`),
      fetch(`/api/couple/documents?bookingId=${bookingId}`),
    ]);
    const bData = await bRes.json();
    const found = (bData.bookings as WeddingBooking[])?.find((b) => b.id === bookingId);
    if (found) {
      setBooking(found);
      setEditFields(found);
    }
    setChecklist((await cRes.json()).items ?? []);
    setMessages((await mRes.json()).messages ?? []);
    setDocuments((await dRes.json()).documents ?? []);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (tab === "messages") {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [tab, messages]);

  async function saveBooking() {
    setSaving(true);
    const res = await fetch("/api/couple/booking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, ...editFields }),
    });
    if (res.ok) {
      const data = await res.json();
      setBooking(data.booking);
      setSavedMsg("Saved ✓");
      setTimeout(() => setSavedMsg(""), 2500);
    }
    setSaving(false);
  }

  async function toggleItem(item: ChecklistItem) {
    const res = await fetch("/api/couple/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, completed: !item.completed }),
    });
    const data = await res.json();
    if (data.item) setChecklist((p) => p.map((i) => (i.id === item.id ? data.item : i)));
  }

  async function addItem() {
    if (!newItemTitle.trim()) return;
    setAddingItem(true);
    const res = await fetch("/api/couple/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: bookingId,
        title: newItemTitle,
        description: newItemDesc || null,
        due_date: newItemDue || null,
        sort_order: checklist.length,
      }),
    });
    const data = await res.json();
    if (data.item) {
      setChecklist((p) => [...p, data.item]);
      setNewItemTitle("");
      setNewItemDue("");
      setNewItemDesc("");
    }
    setAddingItem(false);
  }

  async function deleteItem(id: string) {
    await fetch(`/api/couple/checklist?itemId=${id}`, { method: "DELETE" });
    setChecklist((p) => p.filter((i) => i.id !== id));
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    const res = await fetch("/api/couple/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: draft, bookingId }),
    });
    if (res.ok) {
      setDraft("");
      await load();
    }
    setSending(false);
  }

  async function linkCouple() {
    setLinking(true);
    setLinkResult("");
    const res = await fetch("/api/couple/coordinator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, email: linkEmail }),
    });
    const data = await res.json();
    if (data.booking) {
      setBooking((p) => p ? { ...p, couple_user_id: data.booking.couple_user_id } : p);
      setLinkResult("✓ Couple account linked");
      setLinkEmail("");
    } else {
      setLinkResult(data.error ?? "Failed to link account");
    }
    setLinking(false);
  }

  async function unlinkCouple() {
    if (!confirm("Unlink this couple's account?")) return;
    await fetch(`/api/couple/coordinator?bookingId=${bookingId}`, { method: "DELETE" });
    setBooking((p) => p ? { ...p, couple_user_id: null } : p);
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Use public URL pattern since we don't need client-side supabase storage here
    // Coordinator uploads: use fetch to upload via server action for simplicity
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", docCategory);
    formData.append("bookingId", bookingId);
    // For now, record with a placeholder URL — a real implementation would upload to storage first
    // Using Supabase client directly:
    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    const path = `uploads/${bookingId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("wedding-docs").upload(path, file);
    if (error) { alert("Upload failed: " + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("wedding-docs").getPublicUrl(path);
    await fetch("/api/couple/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: file.name, file_url: publicUrl, category: docCategory, bookingId }),
    });
    await load();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function deleteDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/couple/documents?docId=${id}`, { method: "DELETE" });
    setDocuments((p) => p.filter((d) => d.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-400">Booking not found.</p>
        <button onClick={() => router.back()} className="text-amber-700 text-sm hover:underline mt-3 block mx-auto">← Back</button>
      </div>
    );
  }

  const countdown = daysUntil(booking.wedding_date);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",  label: "Overview" },
    { id: "checklist", label: `Checklist (${checklist.length})` },
    { id: "messages",  label: `Messages (${messages.length})` },
    { id: "documents", label: `Docs (${documents.length})` },
    { id: "settings",  label: "Settings" },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => router.push("/couple/coordinator")} className="text-amber-700 text-sm hover:underline">
        ← All Weddings
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-stone-700">
            {booking.couple_name} &amp; {booking.partner_name}
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {formatDate(booking.wedding_date)}
            {countdown !== null && countdown >= 0 && (
              <span className="ml-2 text-amber-600">({countdown === 0 ? "Today!" : `${countdown} days`})</span>
            )}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b overflow-x-auto" style={{ borderColor: "#e8dfd0" }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`
              text-sm px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors
              ${tab === id
                ? "border-amber-500 text-amber-700 font-medium"
                : "border-transparent text-stone-400 hover:text-stone-600"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8dfd0" }}>
            <div className="px-5 py-3" style={{ background: "#fdf6e3" }}>
              <h2 className="font-serif text-stone-600">Edit Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ background: "#fff" }}>
              {([
                ["couple_name",   "Couple Name",     "text"],
                ["partner_name",  "Partner Name",    "text"],
                ["venue",         "Venue",           "text"],
                ["package",       "Package",         "text"],
                ["wedding_date",  "Wedding Date",    "date"],
                ["ceremony_time", "Ceremony Time",   "time"],
                ["cocktail_time", "Cocktail Hour",   "time"],
                ["reception_time","Reception Time",  "time"],
                ["guest_count",   "Guest Count",     "number"],
              ] as [keyof WeddingBooking, string, string][]).map(([field, label, type]) => (
                <div key={field}>
                  <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editFields[field] as string) ?? ""}
                    onChange={(e) => setEditFields((p) => ({ ...p, [field]: e.target.value || null }))}
                    className="w-full rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-amber-300"
                    style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
                  />
                </div>
              ))}

              {/* Status */}
              <div>
                <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1">Status</label>
                <select
                  value={editFields.status ?? booking.status}
                  onChange={(e) => setEditFields((p) => ({ ...p, status: e.target.value as BookingStatus }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-amber-300"
                  style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* Catering notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1">Catering Notes</label>
                <textarea
                  rows={3}
                  value={(editFields.catering_notes as string) ?? ""}
                  onChange={(e) => setEditFields((p) => ({ ...p, catering_notes: e.target.value || null }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-stone-700 resize-none outline-none focus:ring-2 focus:ring-amber-300"
                  style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
                />
              </div>

              {/* Coordinator notes (private) */}
              <div className="sm:col-span-2">
                <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1">
                  Private Coordinator Notes
                  <span className="ml-1 text-amber-600">(never visible to couple)</span>
                </label>
                <textarea
                  rows={3}
                  value={(editFields.coordinator_notes as string) ?? ""}
                  onChange={(e) => setEditFields((p) => ({ ...p, coordinator_notes: e.target.value || null }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-stone-700 resize-none outline-none focus:ring-2 focus:ring-amber-300"
                  style={{ border: "1px solid #e8dfd0", background: "#fffdf5" }}
                />
              </div>
            </div>
            <div className="px-5 pb-4 flex items-center gap-3" style={{ background: "#fff" }}>
              <button
                onClick={saveBooking}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {savedMsg && <span className="text-emerald-600 text-sm">{savedMsg}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Checklist */}
      {tab === "checklist" && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: "1px solid #e8dfd0" }}>
            <h2 className="font-serif text-stone-600">Add Milestone</h2>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Milestone title…"
              className="w-full rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-amber-300"
              style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newItemDue}
                onChange={(e) => setNewItemDue(e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-sm text-stone-600 outline-none focus:ring-2 focus:ring-amber-300"
                style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
              />
              <input
                type="text"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Optional description"
                className="flex-1 rounded-lg px-3 py-2 text-sm text-stone-600 outline-none focus:ring-2 focus:ring-amber-300"
                style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
              />
            </div>
            <button
              onClick={addItem}
              disabled={addingItem || !newItemTitle.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
            >
              {addingItem ? "Adding…" : "Add Milestone"}
            </button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: "#fff", border: "1px solid #e8dfd0" }}
              >
                <button
                  onClick={() => toggleItem(item)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${item.completed ? "bg-emerald-400 border-emerald-400 text-white" : "border-stone-300 hover:border-amber-400"}`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.completed ? "line-through text-stone-400" : "text-stone-700"}`}>{item.title}</p>
                  {item.description && <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>}
                  {item.due_date && <p className="text-xs text-stone-400 mt-0.5">Due {formatDate(item.due_date)}</p>}
                </div>
                <button onClick={() => deleteItem(item.id)} className="text-stone-300 hover:text-red-400 text-xs transition-colors" aria-label="Delete">✕</button>
              </div>
            ))}
            {checklist.length === 0 && <p className="text-stone-400 text-sm text-center py-6">No milestones yet.</p>}
          </div>
        </div>
      )}

      {/* Tab: Messages */}
      {tab === "messages" && (
        <div className="flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
          <div
            className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-3"
            style={{ background: "#fff", border: "1px solid #e8dfd0" }}
          >
            {messages.length === 0 && (
              <p className="text-stone-400 text-sm text-center py-10">No messages yet.</p>
            )}
            {messages.map((msg) => {
              const isCoord = msg.sender_role === "coordinator";
              return (
                <div key={msg.id} className={`flex flex-col ${isCoord ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isCoord ? "rounded-br-sm bg-amber-600 text-white" : "rounded-bl-sm text-stone-700"}`}
                    style={!isCoord ? { background: "#fdf6e3", border: "1px solid #e8dfd0" } : undefined}
                  >
                    {!isCoord && <p className="text-xs text-stone-400 mb-1 font-medium">Couple</p>}
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 mt-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="Write a message to the couple…"
              className="flex-1 rounded-xl px-3 py-2 text-sm text-stone-700 resize-none outline-none focus:ring-2 focus:ring-amber-300"
              style={{ border: "1px solid #e8dfd0", background: "#fff" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as unknown as React.FormEvent); }
              }}
            />
            <button type="submit" disabled={sending || !draft.trim()} className="self-end px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-40 transition-colors">Send</button>
          </form>
        </div>
      )}

      {/* Tab: Documents */}
      {tab === "documents" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: "1px solid #e8dfd0" }}>
            <h2 className="font-serif text-stone-600">Upload Document</h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm text-stone-600 outline-none"
                style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${uploading ? "bg-stone-100 text-stone-400" : "bg-amber-600 text-white hover:bg-amber-700"}`}>
                {uploading ? "Uploading…" : "Choose File"}
                <input ref={fileRef} type="file" className="sr-only" disabled={uploading} onChange={handleDocUpload} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "#fff", border: "1px solid #e8dfd0" }}>
                <div>
                  <p className="text-stone-700 text-sm font-medium">{doc.file_name}</p>
                  <p className="text-stone-400 text-xs">{CATEGORY_LABELS[doc.category]} · {new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-amber-700 text-xs hover:underline">View</a>
                  <button onClick={() => deleteDoc(doc.id)} className="text-stone-300 hover:text-red-400 text-xs">✕</button>
                </div>
              </div>
            ))}
            {documents.length === 0 && <p className="text-stone-400 text-sm text-center py-6">No documents yet.</p>}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {tab === "settings" && (
        <div className="space-y-4">
          {/* Link couple account */}
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: "1px solid #e8dfd0" }}>
            <h2 className="font-serif text-stone-600">Couple Portal Access</h2>
            {booking.couple_user_id ? (
              <div className="flex items-center justify-between">
                <p className="text-emerald-600 text-sm">✓ Couple account is linked</p>
                <button onClick={unlinkCouple} className="text-xs text-red-400 hover:underline">Unlink</button>
              </div>
            ) : (
              <p className="text-amber-600 text-sm">⚠ No account linked yet — couple cannot log in.</p>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="Couple's sign-in email"
                className="flex-1 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-amber-300"
                style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
              />
              <button
                onClick={linkCouple}
                disabled={linking || !linkEmail}
                className="px-4 py-2 rounded-lg text-sm bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {linking ? "Linking…" : "Link"}
              </button>
            </div>
            {linkResult && (
              <p className={`text-sm ${linkResult.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>
                {linkResult}
              </p>
            )}
            <p className="text-xs text-stone-400">
              The couple must create an account at /login first, then you can link their email here.
            </p>
          </div>

          {/* Quick info */}
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8dfd0" }}>
            <h2 className="font-serif text-stone-600 mb-3">Quick Info</h2>
            <div className="space-y-2 text-sm text-stone-500">
              <p>Booking ID: <span className="font-mono text-xs text-stone-400">{bookingId}</span></p>
              <p>Created: {formatDate(booking.created_at)}</p>
              <p>Last updated: {formatDate(booking.updated_at)}</p>
              <p>Venue: {booking.venue ?? "Not set"}</p>
              <p>Ceremony: {formatTime(booking.ceremony_time)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
