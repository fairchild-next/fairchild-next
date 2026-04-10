"use client";

import Link from "next/link";
import { QrCode, Plant, MagnifyingGlass } from "@phosphor-icons/react";
import { useMember } from "@/lib/memberContext";
import { useKidsMode } from "@/lib/kidsModeContext";
import { useWeddingMode } from "@/lib/weddingModeContext";
import { useEventsMode } from "@/lib/eventsModeContext";
import KidsLearn from "@/components/kids/KidsLearn";
import WeddingDetails from "@/components/wedding/WeddingDetails";
import EventsDetails from "@/components/events/EventsDetails";

export default function LearnPage() {
  const { hasSession, authReady } = useMember();
  const { isKidsMode } = useKidsMode();
  const { isWeddingMode } = useWeddingMode();
  const { isEventsMode } = useEventsMode();

  const inMode = authReady && hasSession;

  if (inMode && isKidsMode) {
    return <KidsLearn />;
  }

  if (inMode && isEventsMode) {
    return <EventsDetails />;
  }

  if (inMode && isWeddingMode) {
    return <WeddingDetails />;
  }

  return (
    <div className="min-h-screen">
      {/* Header – same format as Map/Explore the Garden */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2 border-b border-[var(--surface-border)] pb-4">
          Learn
        </h1>
        <p className="text-[var(--text-muted)]">
          Scan QR codes to discover the plants of Fairchild.
        </p>
      </div>

      {/* Main CTAs – Plant Education */}
      <div className="px-6 space-y-4">
        <Link
          href="/learn/scan"
          className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex gap-4 items-start">
            <QrCode size={28} weight="regular" className="shrink-0 text-[var(--primary)]" />
            <div>
              <h3 className="font-semibold text-lg">Scan QR Code</h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Walk the garden and scan QR codes to identify and learn about plants!
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/learn/plants"
          className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex gap-4 items-start">
            <Plant size={28} weight="regular" className="shrink-0 text-[var(--primary)]" />
            <div>
              <h3 className="font-semibold text-lg">Browse Plants</h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Search our database to learn more about the plants found throughout the garden.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/learn/plant-id"
          className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex gap-4 items-start">
            <MagnifyingGlass size={28} weight="regular" className="shrink-0 text-[var(--primary)]" />
            <div>
              <h3 className="font-semibold text-lg">Plant Identification Guide</h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Learn how to identify common plants with helpful field guide tips.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary – Engagement */}
      <div className="px-6 mt-8 pb-24">
        <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Explore more
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tickets/events"
            className="px-4 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] text-sm font-medium hover:border-[var(--primary)] transition"
          >
            Events & Classes
          </Link>
          <Link
            href="/learn/quiz"
            className="px-4 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] text-sm font-medium hover:border-[var(--primary)] transition"
          >
            Test your Knowledge
          </Link>
        </div>
      </div>
    </div>
  );
}
