"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningEvent,
  bunnyHoppeningEggHuntSchedule,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

export default function EventsSchedulePage() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="Event Schedule"
        backHref="/learn"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-5 shadow-md">
          <Image
            src={ev.images.scheduleHero}
            alt=""
            width={800}
            height={400}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <p className="text-sm font-serif font-semibold text-[#2d3e24] text-center mb-1">
          {ev.dateLine}
        </p>
        <p className="text-sm text-center text-[var(--text-muted)] mb-6">{ev.hoursLine}</p>

        <h2 className="text-lg font-serif font-bold text-[#2d3e24] mb-2">Eggsplore Galore</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Time slots are enforced by age for a safe, fun experience. All-Access ticket required;
          online tickets only.
        </p>

        <div className="space-y-4">
          {bunnyHoppeningEggHuntSchedule.map((group) => (
            <div
              key={group.label}
              className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"
            >
              <p className="font-serif font-bold text-[#2d3e24] mb-2">{group.label}</p>
              <ul className="text-sm text-[var(--text-primary)] space-y-1 list-disc list-inside">
                {group.times.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl overflow-hidden border border-[var(--surface-border)]">
          <Image
            src={ev.images.scheduleFull}
            alt="Full schedule graphic"
            width={1200}
            height={800}
            className="w-full h-auto"
            unoptimized
          />
        </div>

        <a
          href={ev.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-6 block w-full py-3.5 rounded-2xl ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Get tickets on fairchildgarden.org
        </a>
      </div>
    </div>
  );
}
