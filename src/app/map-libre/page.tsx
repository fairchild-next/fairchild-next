/**
 * /map-libre — MapLibre test page
 *
 * This is a SAFE PARALLEL ROUTE for testing the new MapLibre map.
 * The existing /map page (GardenMapLeaflet) is completely untouched.
 *
 * How to test locally:
 *   npm run dev → visit http://localhost:3001/map-libre
 *
 * Once you are satisfied with the MapLibre version you can swap out
 * GardenMapLeaflet for FairchildMapLibre on /map — but that is a
 * separate, deliberate step. Nothing on /map changes today.
 */

import MapLibreClient from "./MapLibreClient";

export default function MapLibreTestPage() {
  return (
    <div className="pt-6 pb-24">
      {/* Premium header */}
      <div className="px-6 mb-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] font-serif leading-tight">
              Explore the Garden
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Discover highlights and find your way. Tap markers for more info.
            </p>
          </div>

          {/* Search + menu icon placeholders (UI shell) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <hr className="border-[var(--surface-border)]" />
      </div>

      {/* MapLibre component — same data, new renderer */}
      <MapLibreClient />

      {/* Dev note — remove before going live */}
      <div
        className="mx-6 mt-6 p-4 rounded-xl text-xs text-[var(--text-muted)]"
        style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
      >
        <p className="font-semibold mb-1 text-[var(--text-primary)]">MapLibre Test Page</p>
        <p>
          Preview at <code className="font-mono">/map-libre</code>. The live map at{" "}
          <code className="font-mono">/map</code> is unchanged.
        </p>
        <p className="mt-1">
          To unlock a custom vector style, add{" "}
          <code className="font-mono">NEXT_PUBLIC_MAPTILER_KEY=…</code> to{" "}
          <code className="font-mono">.env.local</code>.
        </p>
      </div>
    </div>
  );
}
