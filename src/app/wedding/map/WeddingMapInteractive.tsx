"use client";

import dynamic from "next/dynamic";

const GardenMap = dynamic(() => import("@/components/GardenMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-lg bg-[var(--surface)] flex items-center justify-center">
      <span className="text-[var(--text-muted)]">Loading map…</span>
    </div>
  ),
});

export default function WeddingMapInteractive() {
  return (
    <div className="-mx-4 sm:mx-0 rounded-2xl overflow-hidden border border-[var(--surface-border)]">
      <GardenMap configSlug="wedding" poiListReturnPath="/wedding/map" />
    </div>
  );
}
