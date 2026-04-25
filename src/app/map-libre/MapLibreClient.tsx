"use client";

import dynamic from "next/dynamic";

// ssr: false is required for MapLibre (WebGL needs a browser DOM)
// This wrapper must be a Client Component for ssr: false to be allowed.
const FairchildMapLibre = dynamic(
  () => import("@/components/map/FairchildMapLibre"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-xl bg-[var(--surface)] flex items-center justify-center">
        <span className="text-[var(--text-muted)] text-sm">Loading map…</span>
      </div>
    ),
  }
);

export default function MapLibreClient() {
  return <FairchildMapLibre configSlug="default" poiListReturnPath="/map" />;
}
