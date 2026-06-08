import Link from "next/link";

const SECTIONS = [
  {
    title: "Ticket scanning",
    items: [
      "Go to Staff → Scan (bottom nav) or tap 'Scan Tickets' on the dashboard.",
      "Allow camera access when prompted. Point the camera at the visitor's QR code.",
      "Green = valid entry allowed. Yellow = already used. Red = not found.",
      "The ticket is automatically marked as used — you don't need to do anything else.",
    ],
  },
  {
    title: "Garden status (closures & hours)",
    items: [
      "Tap 'Garden Status' on the dashboard or the shield icon in the bottom nav.",
      "Toggle to 'Closed' and add a brief reason (e.g. 'Closed for severe weather').",
      "The message appears instantly on every visitor's home screen.",
      "The status resets automatically at midnight.",
    ],
  },
  {
    title: "Map editor",
    items: [
      "Tap 'Garden Map' on the dashboard or the map icon in the bottom nav.",
      "Tap any existing pin to edit its name, category, or photo.",
      "Long-press the map to drop a new POI.",
      "Use 'Copy from' to copy POIs between map configs (default / events / wedding).",
    ],
  },
  {
    title: "Adding staff",
    items: [
      "Go to Staff → More → Manage Team.",
      "The person must already have an account — they sign up at the app URL.",
      "Enter their email address and tap 'Add to Staff'.",
      "They will have staff access on their next login.",
    ],
  },
];

export default function StaffHelpPage() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] text-sm font-medium">← Back</Link>
      </div>
      <div className="px-5 space-y-5">
        <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
        <p className="text-xl font-bold text-[var(--text-primary)]">Help Center</p>

        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <p className="text-[15px] font-bold text-[var(--text-primary)]">{section.title}</p>
            <ol className="space-y-2 list-decimal list-inside">
              {section.items.map((item, i) => (
                <li key={i} className="text-sm text-[var(--text-muted)] leading-relaxed">{item}</li>
              ))}
            </ol>
          </div>
        ))}

        <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <p className="text-sm text-[var(--text-muted)]">
            Need help with something else? Contact your app administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
