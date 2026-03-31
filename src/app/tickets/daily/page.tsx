"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DailyTicketsContent from "./DailyTicketsContent";

export default function DailyTicketsPage() {
  const router = useRouter();
  const [entryType, setEntryType] = useState<"choice" | "scheduled">("choice");

  if (entryType === "scheduled") {
    return (
      <div className="pb-24">
        <div className="px-6 pt-4">
          <button
            onClick={() => setEntryType("choice")}
            className="text-[var(--primary)] text-sm font-medium"
          >
            ← Back
          </button>
        </div>
        <DailyTicketsContent />
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 pb-24 bg-[var(--background)] min-h-full text-[var(--text-primary)]">
      <h2 className="text-3xl font-semibold mb-6 border-b border-[var(--surface-border)] pb-4">
        Daily Admission
      </h2>

      <p className="text-[var(--text-muted)] mb-6">
        Choose between a Scheduled Ticket to save $5 or a Flex Ticket to enter as you please.
      </p>

      <div className="space-y-6">
        {/* Scheduled Date card – white, Select Date button sage */}
        <div
          onClick={() => setEntryType("scheduled")}
          className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-6 cursor-pointer hover:border-[var(--primary)] transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-medium text-[var(--text-primary)]">Scheduled Date</h3>
            <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium shrink-0">
              Save $5
            </span>
          </div>
          <p className="text-[var(--text-muted)] mb-4">
            Select a day to visit and save $5
          </p>
          <ul className="space-y-2 text-sm text-[var(--text-muted)] mb-4">
            <li>• Guaranteed entry for selected date and time</li>
            <li>• Save $5 per adult ticket</li>
            <li>• Money-back guarantee for unforeseen closures or weather</li>
          </ul>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEntryType("scheduled");
            }}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold"
          >
            Select Date
          </button>
        </div>

        <div className="text-center text-[var(--text-muted)] text-sm">OR</div>

        {/* Flex Ticket card – white, Select Tickets button sage */}
        <div
          onClick={() => router.push("/tickets/flex")}
          className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-6 cursor-pointer hover:border-[var(--primary)] transition"
        >
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">Flex Ticket</h3>
          <p className="text-[var(--text-muted)] mb-4">
            Visit the garden any date you&apos;d like
          </p>
          <ul className="space-y-2 text-sm text-[var(--text-muted)] mb-4">
            <li>• Enter any day within 365 days</li>
            <li>• Not valid for entry on festival days when the garden is closed to general admission</li>
          </ul>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/tickets/flex");
            }}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold"
          >
            Select Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
