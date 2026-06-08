"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GardenStatus = {
  date: string;
  is_closed: boolean;
  closure_reason: string | null;
  special_hours: string | null;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export default function GardenStatusPage() {
  const [status, setStatus] = useState<GardenStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local form state
  const [isClosed, setIsClosed] = useState(false);
  const [closureReason, setClosureReason] = useState("");
  const [specialHours, setSpecialHours] = useState("");

  useEffect(() => {
    fetch("/api/garden-status", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { status: GardenStatus }) => {
        const s = d.status;
        setStatus(s);
        setIsClosed(s.is_closed);
        setClosureReason(s.closure_reason ?? "");
        setSpecialHours(s.special_hours ?? "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/garden-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_closed: isClosed,
          closure_reason: isClosed ? closureReason : null,
          special_hours: !isClosed ? specialHours : null,
        }),
      });
      if (res.ok) {
        const d = await res.json() as { status: GardenStatus };
        setStatus(d.status);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setIsClosed(false);
    setClosureReason("");
    setSpecialHours("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
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
          <p className="text-xl font-bold text-[var(--text-primary)]">Garden Status</p>
        </div>
      </div>

      <div className="px-5 space-y-5">

        {/* Date pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", color: "var(--text-muted)" }}
        >
          <IconShield />
          <span>Today — {TODAY}</span>
        </div>

        {/* Open / Closed toggle card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--surface-border)" }}
        >
          <button
            type="button"
            onClick={() => setIsClosed(false)}
            className="w-full flex items-center justify-between px-5 py-4 transition-colors text-left"
            style={{
              background: !isClosed ? "#d4e8d0" : "var(--surface)",
              borderBottom: "1px solid var(--surface-border)",
            }}
          >
            <div>
              <p className={`text-[15px] font-bold ${!isClosed ? "text-[#193521]" : "text-[var(--text-muted)]"}`}>
                Open — Normal Operations
              </p>
              <p className={`text-xs mt-0.5 ${!isClosed ? "text-[#193521]/70" : "text-[var(--text-muted)]"}`}>
                Garden is open per standard hours
              </p>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: !isClosed ? "#193521" : "var(--surface-border)" }}
            >
              {!isClosed && <div className="w-2.5 h-2.5 rounded-full bg-[#193521]" />}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsClosed(true)}
            className="w-full flex items-center justify-between px-5 py-4 transition-colors text-left"
            style={{
              background: isClosed ? "#fef2f2" : "var(--surface)",
            }}
          >
            <div>
              <p className={`text-[15px] font-bold ${isClosed ? "text-red-700" : "text-[var(--text-muted)]"}`}>
                Closed Today
              </p>
              <p className={`text-xs mt-0.5 ${isClosed ? "text-red-600/70" : "text-[var(--text-muted)]"}`}>
                Garden is closed — visitors will be notified
              </p>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: isClosed ? "#dc2626" : "var(--surface-border)" }}
            >
              {isClosed && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
            </div>
          </button>
        </div>

        {/* Conditional fields */}
        {isClosed && (
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
                Closure Reason <span className="text-[var(--text-muted)] normal-case font-normal">(shown to visitors)</span>
              </label>
              <input
                type="text"
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="e.g. Closed for severe weather"
                maxLength={120}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                This message replaces the hours pill on the guest and member home screens.
              </p>
            </div>
          </div>
        )}

        {!isClosed && (
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
                Special Hours <span className="text-[var(--text-muted)] normal-case font-normal">(optional — overrides default)</span>
              </label>
              <input
                type="text"
                value={specialHours}
                onChange={(e) => setSpecialHours(e.target.value)}
                placeholder="e.g. Open 10:00 AM – 3:00 PM today"
                maxLength={80}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                Leave blank to show default hours (10:00 AM – 5:00 PM). This resets automatically at midnight.
              </p>
            </div>
          </div>
        )}

        {/* Current live state info */}
        {status && (
          <div
            className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            <div
              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
              style={{ background: status.is_closed ? "#dc2626" : "#16a34a" }}
            />
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Currently live</p>
              {status.is_closed
                ? <p className="text-sm font-medium text-[var(--text-primary)]">{status.closure_reason || "Closed today"}</p>
                : status.special_hours
                  ? <p className="text-sm font-medium text-[var(--text-primary)]">{status.special_hours}</p>
                  : <p className="text-sm font-medium text-[var(--text-primary)]">Open 10:00 AM – 5:00 PM (default)</p>
              }
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-opacity disabled:opacity-60 active:opacity-80"
            style={{ background: "var(--primary)" }}
          >
            {saving ? "Saving…" : saved ? "Saved!" : "Save Status"}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-3.5 rounded-2xl text-sm font-semibold text-[var(--text-muted)] transition-colors"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            Reset
          </button>
        </div>

        {saved && (
          <div
            className="rounded-2xl px-5 py-3 text-sm font-semibold text-center"
            style={{ background: "#d4e8d0", color: "#193521" }}
          >
            Status updated — visible to all visitors immediately.
          </div>
        )}
      </div>
    </div>
  );
}
