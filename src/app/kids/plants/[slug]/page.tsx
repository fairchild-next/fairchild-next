"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { randomCharacter, type CharacterType } from "@/components/kids/KidsCharacter";

// Lazy-load the mascot so it never blocks the plant data from rendering
const KidsPlantMascot = dynamic(
  () => import("@/components/kids/KidsPlantMascot"),
  { ssr: false, loading: () => <div className="h-24" /> }
);

const VALID_MASCOTS = new Set<CharacterType>(["butterfly", "flower", "bee", "hummingbird", "frog"]);

type Plant = {
  slug: string;
  common_name: string;
  scientific_name: string;
  description: string | null;
  did_you_know: string | null;
  image_url: string | null;
  plant_type: string | null;
  characteristics: string[];
};

/**
 * First full sentence up to 160 chars, or hard-truncate at 120.
 * Keeps prose short enough for 5–10 year olds.
 */
function kidSummary(text: string | null): string {
  if (!text) return "";
  const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0];
  if (firstSentence && firstSentence.length <= 160) return firstSentence;
  return text.slice(0, 120).trimEnd() + (text.length > 120 ? "…" : "");
}

export default function KidsPlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string | undefined;

  const rawMascot = searchParams.get("mascot") as CharacterType | null;
  const mascotType: CharacterType =
    rawMascot && VALID_MASCOTS.has(rawMascot) ? rawMascot : randomCharacter();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    fetch(`/api/plants/${encodeURIComponent(slug)}`)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((d) => { if (!cancelled) setPlant(d); })
      .catch(() => { if (!cancelled) setPlant(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3EFEE] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce">🌱</div>
          <p className="text-[#193521] font-bold text-lg">Getting your plant ready…</p>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-[#F3EFEE] flex flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="text-6xl">🤔</div>
        <p className="text-[#193521] font-bold text-xl">Uh oh — we can&apos;t find that plant!</p>
        <p className="text-[#193521]/60 text-sm">Try scanning a different sign.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-2xl bg-[#193521] text-white font-bold text-base"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const imgSrc = resolveImageUrl(plant.image_url);
  const summary = kidSummary(plant.description);

  return (
    <div className="min-h-screen bg-[#F3EFEE] pb-28">

      {/* Header */}
      <div className="bg-[#193521] px-6 pt-10 pb-6 text-center relative">
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-10 text-green-200 font-bold text-sm px-3 py-1.5 rounded-xl bg-white/10"
        >
          ← Back
        </button>
        <div className="text-4xl mb-2">🌿</div>
        <h1 className="text-2xl font-bold text-white leading-tight">{plant.common_name}</h1>
        <p className="text-green-300 italic text-sm mt-1">{plant.scientific_name}</p>
      </div>

      {/* Plant photo with character overlaid on bottom-right */}
      {plant.image_url && (
        <div className="mx-6 mt-5 relative">
          {/* Photo */}
          <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] relative bg-[#dde8da]">
            <Image
              src={imgSrc}
              alt={plant.common_name}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
              unoptimized={imgSrc.startsWith("http")}
            />
          </div>
          {/* Character overlaid on photo — scaled down, bottom-right corner */}
          <div
            className="absolute bottom-0 right-0 z-10 pointer-events-none"
            style={{ transform: "scale(0.52)", transformOrigin: "bottom right" }}
          >
            <KidsPlantMascot type={mascotType} />
          </div>
        </div>
      )}

      {/* If no photo, show mascot on its own */}
      {!plant.image_url && (
        <div className="mt-6 flex justify-center">
          <KidsPlantMascot type={mascotType} />
        </div>
      )}

      {/* What is it? */}
      {summary && (
        <div className="mx-6 mt-5 bg-white rounded-3xl p-5 shadow-sm border-2 border-[#193521]/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌱</span>
            <h2 className="text-[#193521] font-bold text-base">What is it?</h2>
          </div>
          <p className="text-[#193521] text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Super cool fact */}
      {plant.did_you_know && (
        <div className="mx-6 mt-4 bg-[#193521] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🤯</span>
            <h2 className="text-white font-bold text-base">Super Cool Fact!</h2>
          </div>
          <p className="text-green-100 text-sm leading-relaxed">{plant.did_you_know}</p>
        </div>
      )}

      {/* Characteristics */}
      {(plant.characteristics?.length ?? 0) > 0 && (
        <div className="mx-6 mt-4">
          <p className="text-[#193521] font-bold text-sm mb-2">🌟 What makes it special:</p>
          <div className="flex flex-wrap gap-2">
            {plant.characteristics.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#7ED957]/20 text-[#193521] border border-[#7ED957]/40"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="mx-6 mt-8 text-center space-y-3">
        <button
          onClick={() => router.push("/learn/scan")}
          className="w-full py-4 rounded-2xl bg-[#7ED957] text-[#193521] font-bold text-base shadow-md active:scale-95 transition-transform"
        >
          🔍 Scan Another Plant!
        </button>
        <button
          onClick={() => router.push("/kids/garden-quest")}
          className="w-full py-3 rounded-2xl bg-white text-[#193521] font-bold text-sm border-2 border-[#193521]/10"
        >
          🗺️ Go to Garden Quest
        </button>
      </div>
    </div>
  );
}
