"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMember } from "@/lib/memberContext";
import { useKidsMode } from "@/lib/kidsModeContext";
import type { ChildProfile } from "@/lib/kidsModeContext";
import { useWeddingMode } from "@/lib/weddingModeContext";
import { useEventsMode } from "@/lib/eventsModeContext";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import { weddingBookletPdfUrl, weddingSiteUrl } from "@/lib/clients/fairchild/weddingContent";
import {
  bunnyHoppeningEvent,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";
import { GARDEN_QUESTS } from "@/lib/kids/gardenQuestData";
import { FOUND_IDS_KEY } from "@/lib/kids/gardenQuestDiscoveries";

const FAIRCHILD_RENEW_URL = "https://www.fairchildgarden.org";

function formatExpiry(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MemberProfilePage() {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const { member, loading, authReady, hasSession } = useMember();
  const { isKidsMode, setKidsMode, activeChild, setActiveChild } = useKidsMode();
  const { isWeddingMode, setWeddingMode } = useWeddingMode();
  const { isEventsMode, setEventsMode } = useEventsMode();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [kidsFoundCount, setKidsFoundCount] = useState(0);
  const [siblingProfiles, setSiblingProfiles] = useState<ChildProfile[]>([]);

  useEffect(() => {
    if (!supabase || !hasSession) return;
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
    // Load all child profiles so we can show the switcher
    fetch("/api/kids/profiles", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { profiles?: ChildProfile[] }) => {
        if (d.profiles) setSiblingProfiles(d.profiles);
      })
      .catch(() => {});
    try {
      const stored = localStorage.getItem(FOUND_IDS_KEY);
      const ids: string[] = stored ? JSON.parse(stored) : [];
      setKidsFoundCount(ids.length);
    } catch {}
  }, [supabase, hasSession]);

  useEffect(() => {
    if (!authReady) return;
    if (!hasSession) {
      router.replace("/login?redirect=" + encodeURIComponent("/member/profile"));
      return;
    }
    if (!loading && !member) {
      router.replace("/login?redirect=" + encodeURIComponent("/member/profile"));
    }
  }, [authReady, hasSession, member, loading, router]);

  if (!authReady) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Redirecting…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Redirecting…</p>
      </div>
    );
  }

  const eventAccent = getCurrentEventAccentColor();

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // Full page reload ensures session is fully cleared (important when switching accounts on mobile)
    window.location.href = "/";
  };

  if (isKidsMode) {
    const otherProfiles = siblingProfiles.filter((p) => p.id !== activeChild?.id);
    return (
      <div className="px-6 pt-6 pb-24 min-h-screen bg-[#F3EFEE]">
        <h1 className="text-2xl font-semibold text-[#193521] mb-2">Profile</h1>

        {/* Active child display */}
        {activeChild && (
          <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-[#d4e8d0]/60">
            <span className="text-3xl" aria-hidden>{activeChild.avatar_emoji}</span>
            <div>
              <p className="text-xs text-[#6A8468] font-medium">Exploring as</p>
              <p className="font-semibold text-[#193521] text-lg leading-tight">{activeChild.name}</p>
            </div>
          </div>
        )}

        {!activeChild && <p className="text-sm text-[var(--text-muted)] mb-6">No explorer selected</p>}

        <div className="space-y-4">
          <button
            onClick={() => {
              setKidsMode(false);
              router.push("/");
            }}
            className="block w-full p-4 rounded-2xl bg-[var(--primary)] border-2 border-[var(--primary)] hover:opacity-90 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Switch back to Adult Mode</p>
                <p className="text-sm text-white/90 mt-0.5">
                  Return to the full member experience
                </p>
              </div>
              <span className="text-white">→</span>
            </div>
          </button>

          {/* Switch child — shown when there are other profiles */}
          {otherProfiles.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] space-y-2">
              <p className="text-xs font-medium text-[var(--text-muted)]">Switch explorer</p>
              <div className="flex flex-wrap gap-2">
                {otherProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveChild(p);
                      router.push("/");
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-[#d4e8d0] bg-white hover:border-[#6A8468] transition text-sm font-medium text-[#193521]"
                  >
                    <span aria-hidden>{p.avatar_emoji}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/kids/profiles"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] hover:border-[#6A8468] transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#193521]">Manage Explorers</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  Add or remove child profiles
                </p>
              </div>
              <span className="text-[#6A8468]">→</span>
            </div>
          </Link>

          <Link
            href="/kids/garden-quest"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] hover:border-[#6A8468] transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#193521]">Garden Quest</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  {kidsFoundCount > 0
                    ? `Found ${kidsFoundCount} of ${GARDEN_QUESTS.length} things!`
                    : "Find plants and animals in the garden"}
                </p>
              </div>
              <span className="text-[#6A8468]">→</span>
            </div>
          </Link>

          <Link
            href="/badges"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] hover:border-[var(--primary)] transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#193521]">View My Badges</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  See the badges you&apos;ve earned
                </p>
              </div>
              <span className="text-[var(--primary)]">→</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  if (isEventsMode) {
    return (
      <div className="px-6 pt-6 pb-24 min-h-screen">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Profile</h1>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setEventsMode(false);
              router.push("/");
            }}
            className="block w-full p-4 rounded-2xl bg-[var(--primary)] border-2 border-[var(--primary)] hover:opacity-90 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Switch back to Adult Mode</p>
                <p className="text-sm text-white/90 mt-0.5">
                  Return to the full member experience
                </p>
              </div>
              <span className="text-white">→</span>
            </div>
          </button>

          <Link
            href="/tickets/events"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] hover:border-[var(--primary)] transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Event admission & reservations</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  General tickets and member reservations (same as main app)
                </p>
              </div>
              <span className="text-[var(--primary)]">→</span>
            </div>
          </Link>

          <Link
            href="/events/add-ons"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 transition hover:opacity-95"
            style={{ borderColor: `${eventAccent}55` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Premium add-ons</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  Picnic baskets, flights, and extras for this event
                </p>
              </div>
              <span style={{ color: eventAccent }}>→</span>
            </div>
          </Link>

          <a
            href={bunnyHoppeningEvent.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 transition hover:opacity-95"
            style={{ borderColor: `${eventAccent}55` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Official event page</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  Full details on fairchildgarden.org
                </p>
              </div>
              <span style={{ color: eventAccent }}>→</span>
            </div>
          </a>
        </div>
      </div>
    );
  }

  if (isWeddingMode) {
    return (
      <div className="px-6 pt-6 pb-24 min-h-screen">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Profile</h1>

        <div className="space-y-4">
          <button
            onClick={() => {
              setWeddingMode(false);
              router.push("/");
            }}
            className="block w-full p-4 rounded-2xl bg-[var(--primary)] border-2 border-[var(--primary)] hover:opacity-90 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Switch back to Adult Mode</p>
                <p className="text-sm text-white/90 mt-0.5">
                  Return to the full member experience
                </p>
              </div>
              <span className="text-white">→</span>
            </div>
          </button>

          <a
            href={weddingBookletPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] hover:border-[var(--primary)] transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Wedding booklet (PDF)</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  Download the official Fairchild wedding guide
                </p>
              </div>
              <span className="text-[var(--primary)]">→</span>
            </div>
          </a>

          <a
            href={weddingSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] hover:border-[var(--primary)] transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Fairchild wedding website</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  Packages, venues, and contact form
                </p>
              </div>
              <span className="text-[var(--primary)]">→</span>
            </div>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-[var(--primary)] text-sm font-medium">
          ← Back
        </Link>
        {showLogoutConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-muted)]">Log out?</span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-500 hover:text-red-400 transition"
            >
              Yes, log out
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-[var(--text-muted)] hover:text-red-500 transition"
          >
            Log out
          </button>
        )}
      </div>

      <h1 className="text-2xl font-semibold mb-6">Member Profile</h1>

      <div className="space-y-4">
        {userEmail && (
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]">
            <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Account</p>
            <p className="font-medium truncate">{userEmail}</p>
          </div>
        )}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Membership type
          </p>
          <p className="font-medium">{member.membership_type}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Valid through
          </p>
          <p className="font-medium">{formatExpiry(member.expires_at)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Member ID
          </p>
          <p className="font-mono font-medium">#{member.member_id}</p>
        </div>

        <Link
          href="/membership"
          className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Digital Membership Card</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                View your QR code for entry
              </p>
            </div>
            <span className="text-[var(--primary)]">→</span>
          </div>
        </Link>

        <Link
          href="/tickets/my"
          className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">View All Tickets</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Your tickets and membership card
              </p>
            </div>
            <span className="text-[var(--primary)]">→</span>
          </div>
        </Link>

        <Link
          href="/account/stats"
          className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Your Stats</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Quiz scores and garden visits
              </p>
            </div>
            <span className="text-[var(--primary)]">→</span>
          </div>
        </Link>

        <a
          href={FAIRCHILD_RENEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-2xl bg-[var(--primary)]/20 border-2 border-[var(--primary)] hover:border-[var(--primary-hover)] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Renew Membership</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Visit Fairchild&apos;s website to renew
              </p>
            </div>
            <span className="text-[var(--primary)]">→</span>
          </div>
        </a>

        <button
          onClick={() => {
            setWeddingMode(false);
            setEventsMode(false);
            setKidsMode(true);
            router.push("/");
          }}
          className="block w-full p-4 rounded-2xl bg-[var(--surface)] border-2 border-[#6A8468] hover:border-[#5a7360] transition text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#6A8468]">Switch to Kids Mode</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Let your kids explore with a fun, kid-friendly interface
              </p>
            </div>
            <span className="text-[#6A8468]">→</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKidsMode(false);
            setWeddingMode(false);
            setEventsMode(true);
            router.push("/");
          }}
          className="block w-full p-4 rounded-2xl bg-[var(--surface)] border-2 transition text-left hover:opacity-95"
          style={{ borderColor: `${eventAccent}55` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: eventAccent }}>
                Events Mode
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Day-of guide, schedule, map, and premium add-ons for featured events
              </p>
            </div>
            <span style={{ color: eventAccent }}>→</span>
          </div>
        </button>

        <button
          onClick={() => {
            setKidsMode(false);
            setEventsMode(false);
            setWeddingMode(true);
            router.push("/");
          }}
          className="block w-full p-4 rounded-2xl bg-[var(--surface)] border-2 border-[var(--surface-border)] hover:border-[var(--primary)] transition text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Wedding Mode</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Explore Fairchild as a wedding venue—packages, venues, and planning
              </p>
            </div>
            <span className="text-[var(--primary)]">→</span>
          </div>
        </button>
      </div>
    </div>
  );
}
