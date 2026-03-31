"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { getDiscoveries, type DiscoveryEntry } from "@/lib/kids/gardenQuestDiscoveries";
import { GARDEN_QUESTS } from "@/lib/kids/gardenQuestData";

function getQuestImage(questId: string): string | undefined {
  return GARDEN_QUESTS.find((q) => q.id === questId)?.image;
}

const KIDS_IMAGES = {
  badgesBanner: "/kids/Untitled_design-20-075be45c-685f-426d-9c02-8aa4316ce1fe.png",
};

type BadgeRow = {
  badge_key: string;
  badge_name: string;
  description: string;
  icon_url?: string | null;
  earned: boolean;
  earned_at?: string | null;
};

const placeholderBadges: BadgeRow[] = [
  { badge_key: "butterfly-finder", badge_name: "Butterfly Finder", description: "", earned: false },
  { badge_key: "flower-spotter", badge_name: "Flower Spotter", description: "", earned: false },
  { badge_key: "tree-explorer", badge_name: "Tree Explorer", description: "", earned: false },
  { badge_key: "flower-collector", badge_name: "Flower Collector", description: "", earned: false },
  { badge_key: "pollinator-pal", badge_name: "Pollinator Pal", description: "", earned: false },
  { badge_key: "nature-photographer", badge_name: "Nature Photographer", description: "", earned: false },
  { badge_key: "nature-detective", badge_name: "Nature Detective", description: "", earned: false },
  { badge_key: "garden-traveler", badge_name: "Garden Traveler", description: "", earned: false },
  { badge_key: "garden-explorer", badge_name: "Garden Explorer", description: "", earned: false },
  { badge_key: "secret-garden", badge_name: "?", description: "A special surprise!", earned: false },
];

export default function KidsBadges() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "discoveries" ? "discoveries" : "badges";
  const [tab, setTab] = useState<"badges" | "discoveries">(initialTab);
  const [discoveries, setDiscoveries] = useState<DiscoveryEntry[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);

  useEffect(() => {
    setTab(searchParams.get("tab") === "discoveries" ? "discoveries" : "badges");
  }, [searchParams]);

  useEffect(() => {
    if (tab !== "discoveries") return;
    const load = async () => {
      try {
        const res = await fetch("/api/discoveries/me", { credentials: "include" });
        const data = await res.json();
        if (data.discoveries?.length) {
          const withNames = data.discoveries.map((d: { questId: string; questName?: string; type: string; content: string; createdAt: string; questImage?: string }) => {
            const quest = GARDEN_QUESTS.find((q) => q.id === d.questId);
            return {
              ...d,
              questName: d.questName ?? quest?.name ?? d.questId,
              questImage: d.questImage ?? quest?.image,
            };
          });
          setDiscoveries(withNames);
          return;
        }
      } catch {
        // fallback to localStorage
      }
      setDiscoveries(getDiscoveries());
    };
    load();
  }, [tab]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch("/api/badges/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setBadges(data.badges ?? []);
        }
      } catch {
        // Not logged in or offline
      }
    };
    fetchBadges();
  }, [tab]);

  return (
    <div className="min-h-screen bg-[#F3EFEE]">
      {/* Badges banner */}
      <div className="relative overflow-hidden">
        <div className="relative h-[10rem] min-h-[180px]">
          <Image
            src={KIDS_IMAGES.badgesBanner}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Badges</h1>
        </div>
      </div>

      {/* Toggle: My Badges / My Discoveries */}
      <div className="px-6 pt-6">
        <div className="flex rounded-2xl border-2 border-[var(--surface-border)] overflow-hidden bg-white">
          <button
            onClick={() => setTab("badges")}
            className={`flex-1 py-3 font-semibold transition ${
              tab === "badges"
                ? "bg-[#6A8468] text-white"
                : "bg-white text-[#193521]"
            }`}
          >
            My Badges
          </button>
          <button
            onClick={() => setTab("discoveries")}
            className={`flex-1 py-3 font-semibold transition ${
              tab === "discoveries"
                ? "bg-[#6A8468] text-white"
                : "bg-white text-[#193521]"
            }`}
          >
            My Discoveries
          </button>
        </div>
      </div>

      {tab === "badges" ? (
        /* Badge grid - earned and locked */
        <div className="px-6 mt-6 pb-24">
          <div className="grid grid-cols-3 gap-3">
            {(badges.length ? badges : placeholderBadges)
              .filter((b) => b.badge_key !== "secret-garden" || b.earned)
              .map((b, i) => (
              <div
                key={b.badge_key ?? i}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 ${
                  b.earned
                    ? "border-[#6A8468] bg-white"
                    : "border-dashed border-[var(--surface-border)] bg-white/50"
                }`}
              >
                {b.earned ? (
                  <>
                    <div className="w-12 h-12 mb-1 flex items-center justify-center shrink-0">
                      {b.icon_url ? (
                        <img src={b.icon_url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">🏅</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[#193521] text-center line-clamp-2">
                      {b.badge_name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl text-[#6A8468]">?</span>
                    <span className="text-[10px] text-[var(--text-muted)] text-center line-clamp-2 mt-1">
                      {b.badge_name}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Earn badges for exploring the garden!
          </p>
        </div>
      ) : (
        /* My Discoveries - photo or description from Garden Quest */
        <div className="px-6 mt-6 pb-24">
          {discoveries.length === 0 ? (
            <div className="rounded-2xl border-2 border-[var(--surface-border)] bg-white p-8 text-center">
              <p className="text-[var(--text-muted)]">
                Your discoveries will appear here! Find things in Garden Quest and snap a photo or describe what you saw.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {discoveries.map((d, i) => (
                <div
                  key={`${d.questId}-${d.createdAt}-${i}`}
                  className="rounded-2xl border-2 border-[var(--surface-border)] bg-white overflow-hidden"
                >
                  <div className="p-3 border-b border-[var(--surface-border)]">
                    <p className="font-semibold text-[#193521]">Found: {d.questName}</p>
                  </div>
                  {d.type === "photo" ? (
                    <div className="relative aspect-video">
                      <img
                        src={d.content}
                        alt={d.questName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      {(d.questImage || getQuestImage(d.questId)) && (
                        <div className="relative aspect-video">
                          <Image
                            src={d.questImage || getQuestImage(d.questId) || ""}
                            alt={d.questName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 448px) 100vw, 448px"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="rounded-xl border border-[var(--surface-border)] bg-[#F8F8F8] p-4">
                          <p className="text-[#193521] whitespace-pre-wrap">{d.content}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
