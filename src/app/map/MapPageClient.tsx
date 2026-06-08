"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useKidsMode } from "@/lib/kidsModeContext";
import { isMapConfigSlug, type MapConfigSlug } from "@/lib/mapConfigs";

const GardenMap = dynamic(() => import("@/components/GardenMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="mx-3 flex h-[min(52vh,28rem)] items-center justify-center rounded-xl bg-[var(--surface)]">
      <span className="text-[var(--text-muted)]">Loading map…</span>
    </div>
  ),
});

function MapBody() {
  const searchParams = useSearchParams();
  const { isKidsMode } = useKidsMode();

  const configSlug: MapConfigSlug = useMemo(() => {
    const q = searchParams.get("config");
    if (q && isMapConfigSlug(q)) return q;
    if (isKidsMode) return "kids";
    return "default";
  }, [searchParams, isKidsMode]);

  return (
    <div className="min-h-0 flex-1 pb-2">
      <GardenMap configSlug={configSlug} poiListReturnPath="/map" allowFullscreen defaultExpanded />
    </div>
  );
}

export default function MapPageClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-3 flex h-[min(52vh,28rem)] items-center justify-center rounded-xl bg-[var(--surface)]">
          <span className="text-[var(--text-muted)]">Loading map…</span>
        </div>
      }
    >
      <MapBody />
    </Suspense>
  );
}
