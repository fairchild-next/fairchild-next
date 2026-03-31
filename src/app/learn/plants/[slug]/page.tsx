"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useParams } from "next/navigation";

type Plant = {
  slug: string;
  common_name: string;
  scientific_name: string;
  description: string | null;
  did_you_know: string | null;
  image_url: string | null;
  plant_type: string | null;
  location: string | null;
  characteristics: string[];
};

export default function PlantDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/plants/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPlant(data);
      })
      .catch(() => setPlant(null))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading || slug === undefined) {
    return (
      <div className="px-6 py-12 text-center text-[var(--text-muted)]">
        Loading…
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="px-6 py-8 space-y-4">
        <Link href="/learn/plants" className="text-[var(--primary)] font-medium">
          ← Back to Browse Plants
        </Link>
        <p className="text-[var(--text-muted)]">Plant not found.</p>
      </div>
    );
  }

  const imgSrc = resolveImageUrl(plant.image_url);

  return (
    <div className="pb-24">
      <div className="px-6 pt-4">
        <Link
          href="/learn/plants"
          className="text-sm text-[var(--primary)] font-medium"
        >
          ← Back to Browse Plants
        </Link>
      </div>

      <div className="px-6 pt-4">
        <h1 className="text-2xl font-semibold">{plant.common_name}</h1>
        <p className="text-[var(--text-muted)] italic mt-1">
          {plant.scientific_name}
        </p>
      </div>

      <div className="mt-4 px-6">
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[var(--surface)]">
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
            unoptimized={imgSrc.startsWith("http")}
          />
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {plant.description && (
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {plant.description}
            </p>
          </div>
        )}

        {plant.did_you_know && (
          <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30">
            <h3 className="text-sm font-semibold text-[var(--primary)] mb-2">
              Did you know?
            </h3>
            <p className="text-sm text-[var(--text-primary)]">
              {plant.did_you_know}
            </p>
          </div>
        )}

        {(plant.plant_type || plant.location || (plant.characteristics?.length ?? 0) > 0) && (
          <div className="flex flex-wrap gap-2">
            {plant.plant_type && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] border border-[var(--surface-border)]">
                {plant.plant_type}
              </span>
            )}
            {plant.location && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] border border-[var(--surface-border)]">
                {plant.location}
              </span>
            )}
            {plant.characteristics?.map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] border border-[var(--surface-border)]"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
