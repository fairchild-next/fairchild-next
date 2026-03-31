"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, PencilSimple } from "@phosphor-icons/react";
import { GARDEN_QUESTS, WORD_HELPER_CATEGORIES, getQuestNameColorClass, type GardenQuestItem } from "@/lib/kids/gardenQuestData";
import { addDiscovery, clearDiscoveries, clearFoundIds, FOUND_IDS_KEY } from "@/lib/kids/gardenQuestDiscoveries";
import BadgeEarnedModal from "@/components/kids/BadgeEarnedModal";

function getFoundIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FOUND_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setFoundIds(ids: string[]) {
  try {
    localStorage.setItem(FOUND_IDS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function QuestName({ quest }: { quest: GardenQuestItem }) {
  const [colorWord, ...restParts] = quest.name.split(" ");
  const rest = restParts.join(" ");
  if (quest.nameColor) {
    return (
      <>
        <span className={getQuestNameColorClass(quest.nameColor)}>{colorWord}</span>{" "}
        <span className="!text-[#193521]">{rest}</span>
      </>
    );
  }
  return <span className="!text-[#193521]">{quest.name}</span>;
}

type BadgeInfo = { badge_name: string; description: string; icon_url?: string | null };

export default function KidsGardenQuestPage() {
  const [tab, setTab] = useState<"discover" | "found">("discover");
  const [foundIds, setFoundIdsState] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "confirm" | "describe" | "word-helper" | "photo-capture">("list");
  const [selectedQuest, setSelectedQuest] = useState<GardenQuestItem | null>(null);
  const [description, setDescription] = useState("");
  const [badgeQueue, setBadgeQueue] = useState<BadgeInfo[]>([]);

  useEffect(() => {
    const loadDiscoveries = async () => {
      const local = getFoundIds();
      try {
        const res = await fetch("/api/discoveries/me", { credentials: "include" });
        const data = await res.json();
        if (data.foundIds?.length) {
          const merged = [...new Set([...local, ...data.foundIds])];
          setFoundIdsState(merged);
          setFoundIds(merged);
        } else {
          setFoundIdsState(local);
        }
      } catch {
        setFoundIdsState(local);
      }
    };
    loadDiscoveries();
  }, []);

  const saveDiscoveryAndCheckBadges = useCallback(
    async (questId: string, questName: string, type: "photo" | "description", content: string, questImage?: string) => {
      addDiscovery({
        questId,
        questName,
        type,
        content,
        questImage,
      });
      const ids = [...new Set([...foundIds, questId])];
      setFoundIdsState(ids);
      setFoundIds(ids);
      setView("list");
      setSelectedQuest(null);
      setDescription("");

      try {
        const saveRes = await fetch("/api/discoveries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            quest_item: questId,
            type,
            content: type === "photo" ? content : content,
          }),
        });
        const data = await saveRes.json();
        if (!saveRes.ok) {
          console.warn("Garden Quest save failed:", saveRes.status, data?.error ?? data);
          return;
        }
        // Badges are returned in the same response (no second request)
        if (data.badges?.length) {
          setBadgeQueue(data.badges);
        }
      } catch {
        // Offline or not logged in - localStorage still works
      }
    },
    [foundIds]
  );

  const handleFoundIt = (quest: GardenQuestItem) => {
    setSelectedQuest(quest);
    setView("confirm");
  };

  const handleReset = useCallback(async () => {
    try {
      const res = await fetch("/api/discoveries/me", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        clearDiscoveries();
        clearFoundIds();
        setFoundIdsState([]);
        setFoundIds([]);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSnapPhoto = () => {
    setView("photo-capture");
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedQuest) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      saveDiscoveryAndCheckBadges(
        selectedQuest.id,
        selectedQuest.name,
        "photo",
        dataUrl,
        selectedQuest.image
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDescribe = () => {
    setView("describe");
    setDescription("");
  };

  const handleSaveDescription = () => {
    if (selectedQuest) {
      saveDiscoveryAndCheckBadges(
        selectedQuest.id,
        selectedQuest.name,
        "description",
        description,
        selectedQuest.image
      );
    }
  };

  const foundQuests = GARDEN_QUESTS.filter((q) => foundIds.includes(q.id));
  const discoverQuests = GARDEN_QUESTS.filter((q) => !foundIds.includes(q.id));

  if (view === "word-helper") {
    return (
      <div className="min-h-screen bg-[#F3EFEE] pb-24">
        <div className="relative overflow-hidden">
          <div className="relative h-[8rem] min-h-[140px]">
            <Image
              src="/kids/garden-quest.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/25" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Garden Quest</h1>
          </div>
        </div>

        <div className="px-6 pt-6">
          <button
            onClick={() => setView(selectedQuest ? "describe" : "list")}
            className="text-[var(--primary)] text-sm font-medium mb-4"
          >
            ← Go Back
          </button>
          <h2 className="text-xl font-semibold text-[#193521] mb-6" style={{ fontFamily: "cursive" }}>
            Word Helper
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {WORD_HELPER_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="rounded-2xl border-2 border-[var(--surface-border)] bg-white p-4"
              >
                <h3 className="font-semibold text-[#193521] mb-2">{cat.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{cat.words.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "photo-capture" && selectedQuest) {
    return (
      <div className="min-h-screen bg-[#F3EFEE] pb-24">
        <div className="relative overflow-hidden">
          <div className="relative h-[8rem] min-h-[140px]">
            <Image
              src="/kids/garden-quest.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/25" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Garden Quest</h1>
          </div>
        </div>

        <div className="px-6 pt-6">
          <button
            onClick={() => setView("confirm")}
            className="text-[var(--primary)] text-sm font-medium mb-4"
          >
            ← Go Back
          </button>
          <p className="font-semibold text-[#193521] mb-2">
            Snap a photo of your <QuestName quest={selectedQuest} />!
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Take a picture or choose one from your gallery.
          </p>
          <label className="block w-full py-4 rounded-2xl border-2 border-dashed border-[var(--surface-border)] bg-white text-center cursor-pointer hover:border-[#6A8468] transition">
            <Camera size={32} weight="regular" className="mx-auto text-[#6A8468] mb-2" />
            <span className="font-medium text-[#193521]">Take or Choose Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handlePhotoCapture}
            />
          </label>
        </div>
      </div>
    );
  }

  if (view === "describe" && selectedQuest) {
    return (
      <div className="min-h-screen bg-[#F3EFEE] pb-24">
        <div className="relative overflow-hidden">
          <div className="relative h-[8rem] min-h-[140px]">
            <Image
              src="/kids/garden-quest.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/25" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Garden Quest</h1>
          </div>
        </div>

        <div className="px-6 pt-6">
          <button
            onClick={() => setView("confirm")}
            className="text-[var(--primary)] text-sm font-medium mb-4"
          >
            ← Go Back
          </button>
          <div className="rounded-2xl border-2 border-[var(--surface-border)] bg-white overflow-hidden mb-4">
            <div className="relative aspect-video">
              <Image
                src={selectedQuest.image}
                alt={selectedQuest.name}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
              />
            </div>
          </div>
          <p className="font-semibold mb-2">
            You found a <QuestName quest={selectedQuest} />!
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3 flex items-center gap-1">
            <PencilSimple size={16} weight="regular" />
            Describe what you saw.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="I saw a..."
            className="w-full min-h-[120px] p-4 rounded-2xl border-2 border-[var(--surface-border)] bg-white text-[#193521] placeholder:text-[var(--text-muted)] resize-none"
          />
          <button
            onClick={() => setView("word-helper")}
            className="mt-3 text-sm text-[var(--text-muted)] underline"
          >
            Word Helper
          </button>
          <button
            onClick={handleSaveDescription}
            className="mt-6 w-full py-4 rounded-2xl bg-[#6A8468] text-white font-semibold"
          >
            Save Discovery
          </button>
        </div>
      </div>
    );
  }

  if (view === "confirm" && selectedQuest) {
    return (
      <div className="min-h-screen bg-[#F3EFEE] pb-24">
        <div className="relative overflow-hidden">
          <div className="relative h-[8rem] min-h-[140px]">
            <Image
              src="/kids/garden-quest.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/25" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Garden Quest</h1>
          </div>
        </div>

        <div className="px-6 pt-6">
          <button
            onClick={() => {
              setView("list");
              setSelectedQuest(null);
            }}
            className="text-[var(--primary)] text-sm font-medium mb-4"
          >
            ← Go Back
          </button>
          <div className="rounded-2xl border-2 border-[var(--surface-border)] bg-white overflow-hidden mb-4">
            <div className="relative aspect-video">
              <Image
                src={selectedQuest.image}
                alt={selectedQuest.name}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
              />
            </div>
          </div>
          <p className="font-semibold text-lg mb-1">
            You found a <QuestName quest={selectedQuest} />!
          </p>
          <p className="text-[var(--text-muted)] mb-6">AMAZING! Let&apos;s save your discovery.</p>

          <div className="space-y-3">
            <button
              onClick={handleSnapPhoto}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[var(--surface-border)] bg-white hover:border-[#6A8468] transition"
            >
              <div className="flex items-center gap-3">
                <Camera size={24} weight="regular" className="text-[#6A8468]" />
                <span className="font-medium text-[#193521]">Snap a Photo</span>
              </div>
              <span className="text-[#6A8468]">→</span>
            </button>
            <p className="text-center text-sm text-[var(--text-muted)]">OR</p>
            <button
              onClick={handleDescribe}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[var(--surface-border)] bg-white hover:border-[#6A8468] transition"
            >
              <div className="flex items-center gap-3">
                <PencilSimple size={24} weight="regular" className="text-[#6A8468]" />
                <span className="font-medium text-[#193521]">Describe it!</span>
              </div>
              <span className="text-[#6A8468]">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFEE] pb-24">
      {badgeQueue.length > 0 && (
        <BadgeEarnedModal
          badge={badgeQueue[0]}
          onClose={() => setBadgeQueue((q) => q.slice(1))}
        />
      )}
      {/* Banner */}
      <div className="relative overflow-hidden">
        <div className="relative h-[10rem] min-h-[180px]">
          <Image
            src="/kids/garden-quest.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Garden Quest</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <Link href="/" className="text-[#6A8468] text-sm font-medium mb-4 inline-block">
          ← Go Back
        </Link>
        <p className="text-[#193521] font-semibold mb-1">
          You found {foundIds.length} / {GARDEN_QUESTS.length} things!
        </p>
        {foundIds.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-[var(--text-muted)] underline mb-3"
          >
            Reset discoveries (for testing)
          </button>
        )}
        <div className="flex rounded-2xl border-2 border-[var(--surface-border)] overflow-hidden bg-white mb-4">
          <button
            onClick={() => setTab("discover")}
            className={`flex-1 py-3 font-semibold transition ${
              tab === "discover"
                ? "bg-[#6A8468] text-white"
                : "bg-white text-[#193521]"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setTab("found")}
            className={`flex-1 py-3 font-semibold transition ${
              tab === "found"
                ? "bg-[#6A8468] text-white"
                : "bg-white text-[#193521]"
            }`}
          >
            Found
          </button>
        </div>

        <p className="text-[var(--text-muted)] text-sm mb-6">How many can you find today?</p>

        {tab === "discover" ? (
          <div className="space-y-4">
            {discoverQuests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex shadow-sm min-h-[100px]"
              >
                <div className="relative w-[38%] min-w-[100px] shrink-0 self-stretch">
                  <Image
                    src={quest.image}
                    alt={quest.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 40vw, 140px"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 p-4 flex flex-col justify-between gap-1">
                  <div>
                    <p className="font-semibold">
                      Find a <QuestName quest={quest} />.
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                      Hint: {quest.hint}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFoundIt(quest)}
                    className="mt-2 self-end px-4 py-2 rounded-xl bg-gray-100 text-[#193521] font-semibold text-sm border border-gray-300 shadow-sm"
                  >
                    Found it!
                  </button>
                </div>
              </div>
            ))}
            {discoverQuests.length === 0 && (
              <p className="text-center text-[var(--text-muted)] py-8">
                You found them all! Great exploring!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {foundQuests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-2xl border-2 border-[var(--surface-border)] bg-white overflow-hidden"
              >
                <div className="relative aspect-video">
                  <Image
                    src={quest.image}
                    alt={quest.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 100vw, 448px"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold">
                    Found: <QuestName quest={quest} />
                  </p>
                </div>
              </div>
            ))}
            {foundQuests.length === 0 && (
              <p className="text-center text-[var(--text-muted)] py-8">
                No discoveries yet. Start exploring!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
