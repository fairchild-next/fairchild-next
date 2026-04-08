"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { WeddingDocument } from "@/lib/couple/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DocTab = "required" | "contracts" | "from_us";

/** Pre-defined document slots the couple needs to submit */
const REQUIRED_SLOTS = [
  { id: "seating_chart",     label: "Seating chart",           desc: "Table assignments for all guests",                  icon: "🪑", urgent: true },
  { id: "guest_list",        label: "Final guest list & RSVPs", desc: "Confirmed attendees with meal selections",          icon: "👥", urgent: true },
  { id: "vendor_contacts",   label: "Vendor contact list",      desc: "Photographer, florist, DJ, officiant, transport",  icon: "📋" },
  { id: "day_of_timeline",   label: "Day-of timeline",          desc: "Minute-by-minute ceremony & reception schedule",   icon: "🕐" },
  { id: "menu_notes",        label: "Menu & dietary notes",     desc: "Final menu choices + any allergy requirements",     icon: "🍽️" },
  { id: "decor_instructions",label: "Décor & setup instructions",desc: "Drop-off items, placement notes, signage",        icon: "🌿" },
];

/** Static documents Fairchild provides to every couple */
const FROM_FAIRCHILD = [
  { id: "welcome_packet",  label: "Welcome packet",        desc: "Fairchild policies, parking, vendor rules",        icon: "📄",  actionLabel: "Download", actionColor: "#4a6741" },
  { id: "venue_floor_plan",label: "Venue floor plan",      desc: "Allee Overlook layout · ceremony + reception",     icon: "🗺️",  actionLabel: "Download", actionColor: "#4a6741" },
  { id: "catering_menu",   label: "Catering menu options", desc: "Awaiting your selections",                         icon: "📋",  actionLabel: "Action needed", actionColor: "#9a7020" },
];

function DocRow({
  icon,
  label,
  desc,
  status,
  onUpload,
  uploading,
  viewUrl,
}: {
  icon: string;
  label: string;
  desc: string;
  status: "not_submitted" | "in_progress" | "received" | "action_needed" | null;
  onUpload?: () => void;
  uploading?: boolean;
  viewUrl?: string;
}) {
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    not_submitted: { label: "Not submitted", color: "#c44",     bg: "#fdeaea" },
    in_progress:   { label: "In progress",   color: "#9a7020",  bg: "#fdf6e3" },
    received:      { label: "Received",      color: "#4a6741",  bg: "#e8efe6" },
    action_needed: { label: "Action needed", color: "#9a7020",  bg: "#fdf6e3" },
  };
  const sc = status ? statusConfig[status] : null;

  return (
    <div className="flex items-start gap-3 py-3 border-b" style={{ borderColor: "#f0f3ee" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: "#f0f3ee" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "#2a3d2a" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "#9aab9a" }}>{desc}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {sc && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>
              {sc.label}
            </span>
          )}
          {viewUrl && (
            <a href={viewUrl} target="_blank" rel="noopener noreferrer"
               className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#e8efe6", color: "#4a6741" }}>
              View
            </a>
          )}
          {onUpload && (
            <button
              onClick={onUpload} disabled={uploading}
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

export default function DocumentsPage() {
  const [tab, setTab]             = useState<DocTab>("required");
  const [documents, setDocuments] = useState<WeddingDocument[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [vaultUploading, setVaultUploading] = useState(false);
  const [vaultCategory, setVaultCategory]   = useState("other");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const vaultRef = useRef<HTMLInputElement>(null);

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
      body: JSON.stringify({ file_name: file.name, file_url: publicUrl, category: vaultCategory }),
    });
    await load();
    setVaultUploading(false);
    if (vaultRef.current) vaultRef.current.value = "";
  }

  function getSlotStatus(slotId: string): { status: "not_submitted" | "received"; url?: string } {
    const match = documents.find((d) => d.category === slotId);
    if (match) return { status: "received", url: match.file_url };
    return { status: "not_submitted" };
  }

  // Coordinator-uploaded docs (not matching any slot)
  const contractDocs = documents.filter((d) => d.category === "contract");
  const otherDocs    = documents.filter((d) => ["floor_plan", "menu", "inspiration", "other"].includes(d.category));

  const urgentSlots     = REQUIRED_SLOTS.filter((s) => s.urgent);
  const nonUrgentSlots  = REQUIRED_SLOTS.filter((s) => !s.urgent);
  const submittedSlots  = REQUIRED_SLOTS.filter((s) => getSlotStatus(s.id).status === "received");

  const TABS: { id: DocTab; label: string }[] = [
    { id: "required",  label: "Required" },
    { id: "contracts", label: "Contracts" },
    { id: "from_us",   label: "From us" },
  ];

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-0">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Documents</h1>
        {loading ? null : (
          <p className="text-xs mt-0.5" style={{ color: "#9aab9a" }}>
            {submittedSlots.length}/{REQUIRED_SLOTS.length} required items submitted
          </p>
        )}
      </div>

      {/* Tab bar */}
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

      {/* ── Required tab ──────────────────────────────────────────── */}
      {!loading && tab === "required" && (
        <div className="px-4 py-3 space-y-3 pb-6">
          {/* Info banner */}
          <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#fdf6e3", border: "1px solid #e8d8a0" }}>
            <span className="text-sm mt-0.5">ℹ️</span>
            <p className="text-xs leading-relaxed" style={{ color: "#7a6020" }}>
              Your coordinator can see all documents in this vault and will be notified when you upload anything new.
            </p>
          </div>

          {/* Urgent */}
          {urgentSlots.some((s) => getSlotStatus(s.id).status === "not_submitted") && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase pb-1" style={{ color: "#c44" }}>Urgent — Action Needed</p>
              <div className="rounded-2xl bg-white shadow-sm px-4">
                {urgentSlots.map((slot) => {
                  const { status, url } = getSlotStatus(slot.id);
                  if (status === "received") return null;
                  return (
                    <DocRow
                      key={slot.id}
                      icon={slot.icon}
                      label={slot.label}
                      desc={slot.desc}
                      status="not_submitted"
                      viewUrl={url}
                      uploading={uploadingSlot === slot.id}
                      onUpload={() => fileRefs.current[slot.id]?.click()}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Submitted */}
          {submittedSlots.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase pb-1" style={{ color: "#9aab9a" }}>Submitted by You</p>
              <div className="rounded-2xl bg-white shadow-sm px-4">
                {submittedSlots.map((slot) => {
                  const { url } = getSlotStatus(slot.id);
                  return (
                    <DocRow key={slot.id} icon={slot.icon} label={slot.label} desc={slot.desc} status="received" viewUrl={url} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Still needed */}
          {nonUrgentSlots.some((s) => getSlotStatus(s.id).status === "not_submitted") && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase pb-1" style={{ color: "#9aab9a" }}>Still Needed from You</p>
              <div className="rounded-2xl bg-white shadow-sm px-4">
                {nonUrgentSlots.map((slot) => {
                  const { status, url } = getSlotStatus(slot.id);
                  if (status === "received") return null;
                  return (
                    <DocRow
                      key={slot.id}
                      icon={slot.icon}
                      label={slot.label}
                      desc={slot.desc}
                      status="not_submitted"
                      viewUrl={url}
                      uploading={uploadingSlot === slot.id}
                      onUpload={() => fileRefs.current[slot.id]?.click()}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* From Fairchild */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase pb-1" style={{ color: "#9aab9a" }}>From Fairchild to You</p>
            <div className="rounded-2xl bg-white shadow-sm px-4">
              {FROM_FAIRCHILD.map((doc) => (
                <DocRow
                  key={doc.id}
                  icon={doc.icon}
                  label={doc.label}
                  desc={doc.desc}
                  status={doc.actionLabel === "Action needed" ? "action_needed" : null}
                />
              ))}
            </div>
          </div>

          {/* Upload vault */}
          <label
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-6 cursor-pointer transition-colors"
            style={{ border: "2px dashed #c4d4c4", background: vaultUploading ? "#f5f8f5" : "transparent" }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#9aab9a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm font-semibold" style={{ color: "#5a6e5a" }}>Have something else to share?</p>
            <p className="text-xs" style={{ color: "#4a6741" }}>
              {vaultUploading ? "Uploading…" : "Upload any file to your vault"}
            </p>
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

      {/* ── Contracts tab ─────────────────────────────────────────── */}
      {!loading && tab === "contracts" && (
        <div className="px-4 py-3 space-y-3 pb-6">
          {contractDocs.length > 0 ? (
            <div className="rounded-2xl bg-white shadow-sm px-4">
              {contractDocs.map((doc) => (
                <DocRow key={doc.id} icon="📝" label={doc.file_name} desc={new Date(doc.created_at).toLocaleDateString()} status="received" viewUrl={doc.file_url} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow-sm p-8 text-center">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-sm font-medium" style={{ color: "#5a6e5a" }}>No contracts yet</p>
              <p className="text-xs mt-1" style={{ color: "#9aab9a" }}>Your coordinator will upload your signed contract here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── From us tab ───────────────────────────────────────────── */}
      {!loading && tab === "from_us" && (
        <div className="px-4 py-3 space-y-3 pb-6">
          <div className="rounded-2xl bg-white shadow-sm px-4">
            {FROM_FAIRCHILD.map((doc) => (
              <DocRow
                key={doc.id}
                icon={doc.icon}
                label={doc.label}
                desc={doc.desc}
                status={doc.actionLabel === "Action needed" ? "action_needed" : null}
              />
            ))}
          </div>
          {otherDocs.length > 0 && (
            <>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#9aab9a" }}>Additional Files</p>
              <div className="rounded-2xl bg-white shadow-sm px-4">
                {otherDocs.map((doc) => (
                  <DocRow key={doc.id} icon="📎" label={doc.file_name} desc={new Date(doc.created_at).toLocaleDateString()} status="received" viewUrl={doc.file_url} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file inputs for each slot */}
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
