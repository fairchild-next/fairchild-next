"use client"

import { useRouter } from "next/navigation"
import { useMember } from "@/lib/memberContext"

export default function TicketsPage() {
  const router = useRouter()
  const { member, loading } = useMember()

  return (
    <div className={`px-6 pt-6 pb-24 ${!member ? "bg-[#F3EFEE] min-h-full text-[#193521]" : ""}`}>
      <h2 className={`text-3xl font-semibold mb-8 border-b pb-4 ${!member ? "border-[#e5e0d8]" : "border-[var(--surface-border)]"}`}>
        Tickets
      </h2>

      <div className="space-y-6">

        {/* Member Tickets – show first when logged-in member */}
        {!loading && member && (
          <div
            onClick={() => router.push("/tickets/member")}
            className="bg-[var(--primary)]/20 border-2 border-[var(--primary)] rounded-2xl p-6 cursor-pointer hover:border-green-400 transition"
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
            className="bg-[#6A8468] border border-[#6A8468] rounded-2xl p-6 cursor-pointer hover:opacity-90 transition"
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
          className={`rounded-2xl p-6 cursor-pointer transition ${
            member
              ? "bg-[var(--surface)] border border-[var(--surface-border)] hover:border-green-500"
              : "bg-white border border-[#e5e0d8] hover:border-[#6A8468]"
          }`}
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