import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { sanitizeMapReturnPath } from "@/lib/mapConfigs";

function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default async function MapPoiDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo: returnToRaw } = await searchParams;
  const backHref = sanitizeMapReturnPath(returnToRaw) ?? "/map";
  const supabase = await createSupabaseServerClient();

  const { data: poi, error } = await supabase
    .from("map_pois")
    .select("id, name, description, details, image_url, lat, lng, category")
    .eq("id", id)
    .single();

  if (error || !poi) {
    return (
      <div className="px-4 py-8">
        <p className="mb-4 text-[var(--text-muted)]">Location not found.</p>
        <Link href={backHref} className="text-[var(--primary)] hover:underline">
          ← Back to map
        </Link>
      </div>
    );
  }

  const imgSrc = resolveImageUrl(poi.image_url, "/stock/garden-1.png");
  const fullDescription = poi.details ?? poi.description ?? "";

  return (
    <div className="px-6 pb-24 max-w-2xl mx-auto w-full min-w-0">
      <Link
        href={backHref}
        className="inline-block mb-4 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        ← Back to map
      </Link>

      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-[var(--surface)]">
        <Image
          src={imgSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 672px) 100vw, 672px"
          priority
          unoptimized={imgSrc.startsWith("http")}
        />
      </div>

      <h1 className="mt-4 text-2xl font-semibold">{poi.name}</h1>

      {fullDescription && (
        <div className="mt-3 whitespace-pre-wrap text-[var(--text-primary)] break-words">
          {fullDescription}
        </div>
      )}

      <a
        href={getDirectionsUrl(Number(poi.lat), Number(poi.lng))}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white"
      >
        Get Directions
      </a>
    </div>
  );
}
