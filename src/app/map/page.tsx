import MapPageClient from "./MapPageClient";

export default function MapPage() {
  return (
    <div className="px-6 pt-6 pb-24">
      <h2 className="text-2xl font-semibold mb-2 border-b border-[var(--surface-border)] pb-4">
        Explore the Garden
      </h2>
      <p className="text-[var(--text-muted)] mb-4">
        Discover highlights and find your way. Tap markers for more info.
      </p>
      <MapPageClient />
      <div className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
        <p>📍 Tap markers to learn about each area</p>
        <p>🗺️ Pinch or scroll to zoom</p>
      </div>
    </div>
  );
}
