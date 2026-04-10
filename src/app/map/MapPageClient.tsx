"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useKidsMode } from "@/lib/kidsModeContext";
import { isMapConfigSlug, type MapConfigSlug } from "@/lib/mapConfigs";

const GardenMap = dynamic(() => import("@/components/GardenMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-lg bg-[var(--surface)] flex items-center justify-center">
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
    <div className="-mx-6 sm:mx-0">
      <GardenMap configSlug={configSlug} poiListReturnPath="/map" />
    </div>
  );
}

export default function MapPageClient() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[480px] rounded-lg bg-[var(--surface)] flex items-center justify-center">
          <span className="text-[var(--text-muted)]">Loading map…</span>
        </div>
      }
    >
      <MapBody />
    </Suspense>
  );
}
