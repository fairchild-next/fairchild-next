"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

type Event = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  image_url: string | null;
  is_festival: boolean;
  is_active: boolean;
  sort_order: number;
};

type TicketType = {
  id: string;
  name: string;
  price: number;
  price_peak: number;
  is_active: boolean;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Field({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">{label}</label>
      {hint && <p className="text-xs text-[var(--text-muted)] mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none disabled:opacity-50"
      style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
    />
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
      style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
    />
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
      style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
    />
  );
}

export default function StaffEventDetailPage() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFestival, setIsFestival] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // New ticket type form
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketName, setNewTicketName] = useState("");
  const [newTicketPrice, setNewTicketPrice] = useState("");
  const [addingTicket, setAddingTicket] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => { void load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [evRes, ttRes] = await Promise.all([
        fetch("/api/admin/events", { credentials: "include" }),
        fetch(`/api/admin/ticket-types?event_id=${id}`, { credentials: "include" }),
      ]);
      if (evRes.ok) {
        const d = await evRes.json() as { events: Event[] };
        const ev = d.events.find((e) => e.id === id) ?? null;
        if (ev) {
          setEvent(ev);
          setName(ev.name);
          setDescription(ev.description ?? "");
          setStartDate(ev.start_date);
          setEndDate(ev.end_date);
          setStartTime(ev.start_time ?? "");
          setEndTime(ev.end_time ?? "");
          setImageUrl(ev.image_url ?? "");
          setIsFestival(ev.is_festival);
          setSortOrder(ev.sort_order);
        }
      }
      if (ttRes.ok) {
        const d = await ttRes.json() as { ticket_types: TicketType[] };
        setTicketTypes(d.ticket_types ?? []);
      }
    } finally { setLoading(false); }
  }

  async function save() {
    if (!event) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          start_date: startDate,
          end_date: endDate,
          start_time: startTime || null,
          end_time: endTime || null,
          image_url: imageUrl.trim() || null,
          is_festival: isFestival,
          sort_order: sortOrder,
        }),
      });
      const d = await res.json() as { event?: Event; error?: string };
      if (res.ok && d.event) {
        setEvent(d.event);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(d.error ?? "Failed to save");
      }
    } finally { setSaving(false); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !event) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/events/${id}/upload-image`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const d = await res.json() as { image_url?: string; error?: string };
      if (res.ok && d.image_url) {
        setImageUrl(d.image_url);
        setEvent((prev) => prev ? { ...prev, image_url: d.image_url! } : prev);
      } else {
        setError(d.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddTicket() {
    const price = parseFloat(newTicketPrice);
    if (!newTicketName.trim() || isNaN(price)) return;
    setAddingTicket(true);
    try {
      const res = await fetch("/api/admin/ticket-types", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTicketName.trim(), price, event_id: id }),
      });
      const d = await res.json() as { ticket_type?: TicketType; error?: string };
      if (res.ok && d.ticket_type) {
        setTicketTypes((prev) => [...prev, d.ticket_type!]);
        setNewTicketName("");
        setNewTicketPrice("");
        setShowNewTicket(false);
      }
    } finally { setAddingTicket(false); }
  }

  async function handleSaveTicketPrice(ticketId: string) {
    const price = parseFloat(editPrice);
    if (isNaN(price)) return;
    const res = await fetch(`/api/admin/ticket-types/${ticketId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price, price_peak: price }),
    });
    if (res.ok) {
      setTicketTypes((prev) => prev.map((t) => t.id === ticketId ? { ...t, price, price_peak: price } : t));
      setEditingTicketId(null);
    }
  }

  async function handleToggleTicket(ticket: TicketType) {
    const res = await fetch(`/api/admin/ticket-types/${ticket.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !ticket.is_active }),
    });
    if (res.ok) {
      setTicketTypes((prev) => prev.map((t) => t.id === ticket.id ? { ...t, is_active: !t.is_active } : t));
    }
  }

  if (loading) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
        <div className="px-5 pt-12 pb-4">
          <div className="h-6 w-40 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
        </div>
        <div className="px-5 space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />)}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} className="pb-24 px-5">
        <div className="text-center space-y-3">
          <p className="text-[var(--text-primary)] font-semibold">Event not found</p>
          <Link href="/staff/events" className="text-sm text-[var(--primary)] font-semibold">← Back to Events</Link>
        </div>
      </div>
    );
  }

  const sectionCard = "rounded-2xl p-5 space-y-4";
  const sectionStyle = { background: "var(--surface)", border: "1px solid var(--surface-border)" };

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/events" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"><IconBack /></Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Events</p>
          <p className="text-xl font-bold text-[var(--text-primary)] truncate">{event.name}</p>
        </div>
        <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold ${event.is_active ? "text-[#193521] bg-[#d4e8d0]" : "text-[var(--text-muted)] bg-[var(--surface)]"}`}>
          {event.is_active ? "Live" : "Draft"}
        </span>
      </div>

      <div className="px-5 space-y-5">

        {/* Event image */}
        <div className={sectionCard} style={sectionStyle}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Event Image</p>
          <div className="relative rounded-xl overflow-hidden bg-[var(--background)]" style={{ aspectRatio: "16/7" }}>
            {imageUrl ? (
              <Image src={imageUrl} alt={event.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-muted)] text-sm">No image</div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
              style={{ background: "var(--primary)" }}
            >
              <IconUpload /> {uploading ? "Uploading…" : "Upload Image"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Or paste image URL</label>
            <TextInput value={imageUrl} onChange={setImageUrl} placeholder="/events/mango-festival.png" />
          </div>
        </div>

        {/* Basic info */}
        <div className={sectionCard} style={sectionStyle}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Basic Info</p>

          <Field label="Event Name">
            <TextInput value={name} onChange={setName} placeholder="Mango Festival 2027" />
          </Field>

          <Field label="Description" hint="Shown in the events listing and tickets page.">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell guests what makes this event special…"
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
              style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><DateInput value={startDate} onChange={setStartDate} /></Field>
            <Field label="End Date"><DateInput value={endDate} onChange={setEndDate} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Open Time"><TimeInput value={startTime} onChange={setStartTime} /></Field>
            <Field label="Close Time"><TimeInput value={endTime} onChange={setEndTime} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sort Order" hint="Lower = shown first">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                min={0}
                max={99}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
              />
            </Field>
            <Field label="Type">
              <button
                type="button"
                onClick={() => setIsFestival(!isFestival)}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: isFestival ? "#d4e8d0" : "var(--background)",
                  border: "1px solid var(--surface-border)",
                  color: isFestival ? "#193521" : "var(--text-primary)",
                }}
              >
                {isFestival && <IconCheck />}
                {isFestival ? "Festival" : "Regular event"}
              </button>
            </Field>
          </div>
        </div>

        {/* Ticket pricing */}
        <div className={sectionCard} style={sectionStyle}>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-[var(--text-primary)]">Ticket Pricing</p>
            <button
              onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: "var(--primary)" }}
            >
              <IconPlus /> Add
            </button>
          </div>

          {ticketTypes.length === 0 && !showNewTicket && (
            <p className="text-sm text-[var(--text-muted)] text-center py-3">No ticket types yet. Tap Add to create the first one.</p>
          )}

          <div className="space-y-2">
            {ticketTypes.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)", opacity: t.is_active ? 1 : 0.5 }}>
                {/* Inline edit or display */}
                {editingTicketId === t.id ? (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        step="0.01"
                        min="0"
                        className="mt-1 w-28 px-2 py-1 rounded-lg text-sm focus:outline-none"
                        style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                        autoFocus
                      />
                    </div>
                    <button onClick={() => handleSaveTicketPrice(t.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ background: "var(--primary)" }}>Save</button>
                    <button onClick={() => setEditingTicketId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)]"
                      style={{ border: "1px solid var(--surface-border)" }}>✕</button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">${t.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => { setEditingTicketId(t.id); setEditPrice(t.price.toString()); }}
                      className="text-xs font-semibold text-[var(--primary)] px-2 py-1 rounded-lg"
                      style={{ border: "1px solid var(--primary)" }}
                    >Edit</button>
                    <button
                      onClick={() => handleToggleTicket(t)}
                      className="text-xs font-semibold text-[var(--text-muted)] px-2 py-1 rounded-lg"
                      style={{ border: "1px solid var(--surface-border)" }}
                    >{t.is_active ? "Hide" : "Show"}</button>
                  </>
                )}
              </div>
            ))}

            {showNewTicket && (
              <div className="rounded-xl p-3 space-y-3" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Ticket Name</label>
                    <input type="text" value={newTicketName} onChange={(e) => setNewTicketName(e.target.value)}
                      placeholder="Adult" autoFocus
                      className="w-full px-2.5 py-2 rounded-lg text-sm focus:outline-none"
                      style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Price ($)</label>
                    <input type="number" value={newTicketPrice} onChange={(e) => setNewTicketPrice(e.target.value)}
                      placeholder="24.95" step="0.01" min="0"
                      className="w-full px-2.5 py-2 rounded-lg text-sm focus:outline-none"
                      style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddTicket} disabled={!newTicketName.trim() || !newTicketPrice || addingTicket}
                    className="flex-1 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: "var(--primary)" }}>
                    {addingTicket ? "Adding…" : "Add Ticket Type"}
                  </button>
                  <button onClick={() => { setShowNewTicket(false); setNewTicketName(""); setNewTicketPrice(""); }}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-muted)]"
                    style={{ border: "1px solid var(--surface-border)" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-700 font-medium" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
            {error}
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: "var(--background)", borderTop: "1px solid var(--surface-border)" }}>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl text-base font-bold text-white disabled:opacity-60 transition flex items-center justify-center gap-2"
          style={{ background: "var(--primary)" }}
        >
          {saving ? "Saving…" : saved ? <><IconCheck /> Saved!</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
