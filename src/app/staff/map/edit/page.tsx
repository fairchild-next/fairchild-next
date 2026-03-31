"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const MapEditor = dynamic(() => import("@/components/MapEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-[var(--text-muted)]">Loading map editor…</span>
    </div>
  ),
});

export default function MapEditorPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <span className="text-[var(--text-muted)]">Loading map editor…</span>
          </div>
        }
      >
        <MapEditor />
      </Suspense>
    </div>
  );
}
