"use client";

import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import type { WeddingDocument } from "@/lib/couple/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DocTab = "required" | "contracts" | "from_us";

// ── SVG icons (no emojis) ──────────────────────────────────────────────────
const SvgIcons: Record<string, ReactNode> = {
  chair: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v7M19 3v7M5 10h14M8 10v7M16 10v7M6 17h12" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
    </svg>
  ),
  fork: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h1v5" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

type SlotDef = { id: string; label: string; desc: string; iconKey: string; urgent?: boolean };

const REQUIRED_SLOTS: SlotDef[] = [
  { id: "seating_chart",      label: "Seating chart",            desc: "Table assignments for all guests",                 iconKey: "chair",     urgent: true },
  { id: "guest_list",         label: "Final guest list & RSVPs", desc: "Confirmed attendees with meal selections",         iconKey: "people",    urgent: true },
  { id: "vendor_contacts",    label: "Vendor contact list",      desc: "Photographer, florist, DJ, officiant, transport",  iconKey: "clipboard" },
  { id: "day_of_timeline",    label: "Day-of timeline",          desc: "Minute-by-minute ceremony & reception schedule",   iconKey: "clock" },
  { id: "menu_notes",         label: "Menu & dietary notes",     desc: "Final menu choices + any allergy requirements",    iconKey: "fork" },
  { id: "decor_instructions", label: "Décor & setup instructions", desc: "Drop-off items, placement notes, signage",       iconKey: "pin" },
];

type FairchildDoc = { id: string; label: string; desc: string; iconKey: string; status: "download" | "action_needed" };

const FROM_FAIRCHILD: FairchildDoc[] = [
  { id: "welcome_packet",   label: "Welcome packet",        desc: "Fairchild policies, parking, vendor rules",    iconKey: "file",  status: "download" },
  { id: "venue_floor_plan", label: "Venue floor plan",      desc: "Allee Overlook layout · ceremony + reception", iconKey: "map",   status: "download" },
  { id: "catering_menu",    label: "Catering menu options", desc: "Awaiting your selections · Due Sep 15",        iconKey: "menu",  status: "action_needed" },
];

// ── StatusBadge ────────────────────────────────────────────────────────────
function StatusBadge({ type }: { type: "not_submitted" | "in_progress" | "received" | "action_needed" }) {
  const cfg = {
    not_submitted: { label: "Not submitted", color: "#c44",    bg: "#fdeaea" },
    in_progress:   { label: "In progress",   color: "#9a7020", bg: "#fdf6e3" },
    received:      { label: "Received",      color: "#4a6741", bg: "#e8efe6" },
    action_needed: { label: "Action needed", color: "#9a7020", bg: "#fdf6e3" },
  }[type];
  return (
    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ── DocRow ─────────────────────────────────────────────────────────────────
function DocRow({
  iconKey,
  label,
  desc,
  status,
  onUpload,
  uploading,
  viewUrl,
}: {
  iconKey: string;
  label: string;
  desc: string;
  status?: "not_submitted" | "in_progress" | "received" | "action_needed";
  onUpload?: () => void;
  uploading?: boolean;
  viewUrl?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b last:border-0" style={{ borderColor: "#f0f3ee" }}>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "#e8efe6" }}
      >
        {SvgIcons[iconKey] ?? SvgIcons.file}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "#2a3d2a" }}>{label}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#9aab9a" }}>{desc}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {status && <StatusBadge type={status} />}
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#e8efe6", color: "#4a6741" }}
            >
              {SvgIcons.download}
              View
            </a>
          )}
          {onUpload && (
            <button
              onClick={onUpload}
              disabled={uploading}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors"
              style={{ borderColor: "#c4d4c4", color: "#5a6e5a", background: "#fff" }}
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionLabel({ children, color = "#9aab9a" }: { children: ReactNode; color?: string }) {
  return (
    <p className="text-[10px] font-bold tracking-widest uppercase pt-1 pb-2" style={{ color }}>
      {children}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [tab, setTab]                       = useState<DocTab>("required");
  const [documents, setDocuments]           = useState<WeddingDocument[]>([]);
  const [loading, setLoading]               = useState(true);
  const [uploadingSlot, setUploadingSlot]   = useState<string | null>(null);
  const [vaultUploading, setVaultUploading] = useState(false);
  const fileRefs   = useRef<Record<string, HTMLInputElement | null>>({});
  const vaultRef   = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/couple/documents");
    setDocuments((await res.json()).documents ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function uploadForSlot(slotId: string, file: File) {
    setUploadingSlot(slotId);
    const supabase = createSupabaseBrowserClient();
    const path = `slots/${slotId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("wedding-docs").upload(path, file);
    if (error) { alert("Upload failed: " + error.message); setUploadingSlot(null); return; }
    const { data: { publicUrl } } = supabase.storage.from("wedding-docs").getPublicUrl(path);
    await fetch("/api/couple/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: file.name, file_url: publicUrl, category: slotId }),
    });
    await load();
    setUploadingSlot(null);
  }

  async function uploadToVault(file: File) {
    setVaultUploading(true);
    const supabase = createSupabaseBrowserClient();
    const path = `vault/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("wedding-docs").upload(path, file);
    if (error) { alert("Upload failed: " + error.message); setVaultUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("wedding-docs").getPublicUrl(path);
    await fetch("/api/couple/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: file.name, file_url: publicUrl, category: "other" }),
    });
    await load();
    setVaultUploading(false);
    if (vaultRef.current) vaultRef.current.value = "";
  }

  function slotInfo(slotId: string): { received: boolean; url?: string } {
    const match = documents.find((d) => d.category === slotId);
    return match ? { received: true, url: match.file_url } : { received: false };
  }

  const submittedSlots  = REQUIRED_SLOTS.filter((s) => slotInfo(s.id).received);
  const urgentMissing   = REQUIRED_SLOTS.filter((s) => s.urgent && !slotInfo(s.id).received);
  const nonUrgentMissing = REQUIRED_SLOTS.filter((s) => !s.urgent && !slotInfo(s.id).received);
  const contractDocs    = documents.filter((d) => d.category === "contract");

  const TABS: { id: DocTab; label: string }[] = [
    { id: "required",  label: "Required" },
    { id: "contracts", label: "Contracts" },
    { id: "from_us",   label: "From us" },
  ];

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-4 pt-5">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Documents</h1>
        <p className="text-xs mt-0.5" style={{ color: "#9aab9a" }}>
          {submittedSlots.length}/{REQUIRED_SLOTS.length} required items submitted
        </p>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="flex px-4 border-b mt-3" style={{ borderColor: "#e4ebe4" }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors mr-1"
            style={tab === id
              ? { borderColor: "#4a6741", color: "#2a3d2a" }
              : { borderColor: "transparent", color: "#9aab9a" }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
        </div>
      )}

      {/* ── Required tab ──────────────────────────────────────── */}
      {!loading && tab === "required" && (
        <div className="px-4 py-4 space-y-3 pb-6">

          {/* Info banner */}
          <div className="rounded-xl px-3 py-2.5 flex items-start gap-2.5" style={{ background: "#fdf6e3", border: "1px solid #e8d8a0" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="#9a7020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs leading-relaxed" style={{ color: "#7a6020" }}>
              Your coordinator can see all documents in this vault and will be notified when you upload anything new.
            </p>
          </div>

          {/* Urgent */}
          {urgentMissing.length > 0 && (
            <div>
              <SectionLabel color="#c44">Urgent — Action Needed</SectionLabel>
              <div className="rounded-2xl bg-white shadow-sm px-4">
                {urgentMissing.map((slot) => (
                  <DocRow
                    key={slot.id}
                    iconKey={slot.iconKey}
                    label={slot.label}
                    desc={slot.desc}
                    status="not_submitted"
                    uploading={uploadingSlot === slot.id}
                    onUpload={() => fileRefs.current[slot.id]?.click()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submitted */}
          {submittedSlots.length > 0 && (
            <div>
              <SectionLabel>Submitted by You</SectionLabel>
              <div className="rounded-2xl bg-white shadow-sm px-4">
                {submittedSlots.map((slot) => {
                  const { url } = slotInfo(slot.id);
                  return <DocRow key={slot.id} iconKey={slot.iconKey} label={slot.label} desc={slot.desc} status="received" viewUrl={url} />;
                })}
              </div>
            </div>
          )}

          {/* Still needed */}
          {nonUrgentMissing.length > 0 && (
            <div>
              <SectionLabel>Still Needed from You</SectionLabel>
              <div className="rounded-2xl bg-white shadow-sm px-4">
                {nonUrgentMissing.map((slot) => (
                  <DocRow
                    key={slot.id}
                    iconKey={slot.iconKey}
                    label={slot.label}
                    desc={slot.desc}
                    status="not_submitted"
                    uploading={uploadingSlot === slot.id}
                    onUpload={() => fileRefs.current[slot.id]?.click()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* From Fairchild */}
          <div>
            <SectionLabel>From Fairchild to You</SectionLabel>
            <div className="rounded-2xl bg-white shadow-sm px-4">
              {FROM_FAIRCHILD.map((doc) => (
                <DocRow
                  key={doc.id}
                  iconKey={doc.iconKey}
                  label={doc.label}
                  desc={doc.desc}
                  status={doc.status === "action_needed" ? "action_needed" : undefined}
                />
              ))}
            </div>
          </div>

          {/* Vault upload */}
          <label
            className="flex flex-col items-center justify-center gap-2.5 rounded-2xl py-6 cursor-pointer"
            style={{ border: "2px dashed #c4d4c4" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#e8efe6" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#4a6741" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "#5a6e5a" }}>Have something else to share?</p>
              <p className="text-xs mt-0.5" style={{ color: "#4a6741" }}>
                {vaultUploading ? "Uploading…" : "Upload any file to your vault"}
              </p>
            </div>
            <input
              ref={vaultRef}
              type="file"
              className="sr-only"
              disabled={vaultUploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadToVault(f); }}
            />
          </label>
        </div>
      )}

      {/* ── Contracts tab ──────────────────────────────────────── */}
      {!loading && tab === "contracts" && (
        <div className="px-4 py-4 pb-6">
          {contractDocs.length > 0 ? (
            <div className="rounded-2xl bg-white shadow-sm px-4">
              {contractDocs.map((doc) => (
                <DocRow
                  key={doc.id}
                  iconKey="file"
                  label={doc.file_name}
                  desc={new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  status="received"
                  viewUrl={doc.file_url}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow-sm p-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#e8efe6" }}>
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#5a6e5a" }}>No contracts yet</p>
              <p className="text-xs mt-1" style={{ color: "#9aab9a" }}>Your coordinator will upload your signed contract here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── From us tab ────────────────────────────────────────── */}
      {!loading && tab === "from_us" && (
        <div className="px-4 py-4 pb-6">
          <div className="rounded-2xl bg-white shadow-sm px-4">
            {FROM_FAIRCHILD.map((doc) => (
              <DocRow
                key={doc.id}
                iconKey={doc.iconKey}
                label={doc.label}
                desc={doc.desc}
                status={doc.status === "action_needed" ? "action_needed" : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hidden file inputs for slot uploads */}
      {REQUIRED_SLOTS.map((slot) => (
        <input
          key={slot.id}
          type="file"
          className="sr-only"
          ref={(el) => { fileRefs.current[slot.id] = el; }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadForSlot(slot.id, f); }}
        />
      ))}
    </div>
  );
}
