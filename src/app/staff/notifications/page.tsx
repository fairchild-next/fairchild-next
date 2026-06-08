import Link from "next/link";

export default function StaffNotificationsPage() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] text-sm font-medium">← Back</Link>
      </div>
      <div className="px-5 space-y-4">
        <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
        <p className="text-xl font-bold text-[var(--text-primary)]">Push Notifications</p>
        <div className="rounded-2xl p-5 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Coming Soon</p>
          <p className="text-sm text-[var(--text-muted)]">
            Send day-of alerts and event reminders to members who have installed the app. This feature is planned for a future release.
          </p>
        </div>
      </div>
    </div>
  );
}
