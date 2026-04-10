"use client"

import { useRouter } from "next/navigation"
import { useMember } from "@/lib/memberContext"

export default function TicketsPage() {
  const router = useRouter()
  const { member, loading } = useMember()

  return (
    <div className="px-6 pt-6 pb-24">
      <h2 className="text-2xl font-semibold mb-8 border-b border-[var(--surface-border)] pb-4">
        Tickets
      </h2>

      <div className="space-y-6">

        {/* Member Tickets – show first when logged-in member */}
        {!loading && member && (
          <div
            onClick={() => router.push("/tickets/member")}
            className="bg-[var(--primary)]/20 border-2 border-[var(--primary)] rounded-2xl p-6 cursor-pointer hover:border-[var(--primary-hover)] transition"
          >
            <h3 className="text-xl font-medium mb-2">
              Member Tickets
            </h3>
            <p className="text-[var(--text-muted)]">
              Free admission every day. Reserve tickets for yourself and guests.
            </p>
          </div>
        )}

        {/* Daily Admission Card – hidden for members (they use Member Tickets). Non-member: sage green */}
        {!member && (
          <div
            onClick={() => router.push("/tickets/daily")}
            className="bg-[var(--primary)] border border-[var(--primary)] rounded-2xl p-6 cursor-pointer hover:opacity-90 transition"
          >
            <h3 className="text-xl font-medium mb-2 text-white">
              Daily Admission
            </h3>
            <p className="text-white/90">
              Visit the Garden any day. Choose scheduled or flexible entry.
            </p>
          </div>
        )}

        {/* Special Events / All Special Events – label differs for member vs guest. Non-member: white */}
        <div
          onClick={() => router.push("/tickets/events")}
          className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-6 cursor-pointer hover:border-[var(--primary)] transition"
        >
          <h3 className="text-xl font-medium mb-2">
            {member ? "All Special Events" : "Special Events"}
          </h3>
          <p className="text-[var(--text-muted)]">
            Yoga, concerts, workshops, and seasonal experiences.
          </p>
        </div>

      </div>
    </div>
  )
}