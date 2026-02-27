"use client"

import { useRouter } from "next/navigation"

export default function TicketsPage() {
  const router = useRouter()

  return (
    <div className="px-6 pt-6 pb-24">
      <h2 className="text-3xl font-semibold mb-8 border-b border-[var(--surface-border)] pb-4">
        Tickets
      </h2>

      <div className="space-y-6">

        {/* Daily Admission Card */}
        <div
          onClick={() => router.push("/tickets/daily")}
          className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-6 cursor-pointer hover:border-green-500 transition"
        >
          <h3 className="text-xl font-medium mb-2">
            Daily Admission
          </h3>
          <p className="text-[var(--text-secondary)]">
            Visit the Garden any day. Choose scheduled or flexible entry.
          </p>
        </div>

        {/* Special Events Card */}
        <div
          onClick={() => router.push("/tickets/events")}
          className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-6 cursor-pointer hover:border-green-500 transition"
        >
          <h3 className="text-xl font-medium mb-2">
            Special Events
          </h3>
          <p className="text-[var(--text-secondary)]">
            Yoga, concerts, workshops, and seasonal experiences.
          </p>
        </div>

      </div>
    </div>
  )
}