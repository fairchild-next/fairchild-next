"use client";

import Link from "next/link";

type ToolItem = {
  label: string;
  description: string;
  href: string;
  status: "live" | "soon";
};

const TOOLS: ToolItem[] = [
  // Live tools
  { label: "Ticket Scanner",   description: "Scan QR codes at the gate for entry",             href: "/staff/scanner",        status: "live" },
  { label: "Garden Map",       description: "Add and edit POIs, layers, and zones",             href: "/staff/map/edit",       status: "live" },
  { label: "Map Overlay",      description: "Upload and position the illustrated garden map",   href: "/staff/map/overlay",    status: "live" },
  { label: "Garden Status",    description: "Mark garden open, closed, or special hours",       href: "/staff/garden-status",  status: "live" },
  { label: "Manage Team",      description: "Add and remove staff portal access",               href: "/staff/team",           status: "live" },
  // Phase B — now live
  { label: "Events Manager",   description: "Create, activate, and deactivate events",          href: "/staff/events",         status: "live" },
  { label: "Events Mode",      description: "Turn Events Mode on and set the featured event",   href: "/staff/modes/events",   status: "live" },
  { label: "What's Blooming",  description: "Update the seasonal featured card on the home page", href: "/staff/homepage",     status: "live" },
  { label: "Ticket Pricing",   description: "Edit ticket prices inside each event's editor",    href: "/staff/events",         status: "live" },
  // Phase C — now live
  { label: "Plants Database",  description: "Add and edit plants for QR scanning and Learn",    href: "/staff/plants",         status: "live" },
  { label: "Garden Quest",     description: "Manage Kids Mode quest items and badges",          href: "/staff/modes/kids",     status: "live" },
  // Phase C remaining — coming soon
  { label: "Wedding Portal",   description: "Manage wedding bookings and couples",              href: "/staff/coordinator",    status: "live" },
  { label: "Daily Schedule",   description: "Time slots, open dates, and admission capacity",   href: "/staff/schedule",       status: "live" },
];

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

const live = TOOLS.filter((t) => t.status === "live");
const soon = TOOLS.filter((t) => t.status === "soon");

export default function StaffMorePage() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
          <IconBack />
        </Link>
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">All Tools</p>
        </div>
      </div>

      <div className="px-5 space-y-6 pb-6">

        {/* Live tools */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1">Available Now</p>
          {live.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-opacity active:opacity-70"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[var(--text-primary)]">{tool.label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{tool.description}</p>
              </div>
              <span className="text-[var(--primary)]"><IconChevron /></span>
            </Link>
          ))}
        </div>

        {/* Coming soon tools */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1">Coming Soon</p>
          {soon.map((tool) => (
            <div
              key={tool.href}
              className="flex items-center gap-4 rounded-2xl px-5 py-4 opacity-50"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[var(--text-primary)]">{tool.label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{tool.description}</p>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: "var(--surface-border)", color: "var(--text-muted)" }}
              >
                Soon
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
