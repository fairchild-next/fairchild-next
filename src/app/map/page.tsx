import MapPageClient from "./MapPageClient";

export default function MapPage() {
  return (
    <div className="pt-6 pb-24">
      <div className="px-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] font-serif mb-1">
          Explore the Garden
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Discover highlights and find your way. Tap markers for more info.
        </p>
        <hr className="border-[var(--surface-border)]" />
      </div>
      <MapPageClient />
    </div>
  );
}
