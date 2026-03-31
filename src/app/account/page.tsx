"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMember } from "@/lib/memberContext";
import { useKidsMode } from "@/lib/kidsModeContext";
import { useWeddingMode } from "@/lib/weddingModeContext";
import { useEventsMode } from "@/lib/eventsModeContext";
import { weddingBookletPdfUrl, weddingSiteUrl } from "@/lib/clients/fairchild/weddingContent";
import {
  bunnyHoppeningEvent,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

/** Account page for logged-in guests (non-members). Members are redirected to /member/profile. */
export default function AccountPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { member, loading } = useMember();
  const { isKidsMode, setKidsMode } = useKidsMode();
  const { isWeddingMode, setWeddingMode } = useWeddingMode();
  const { isEventsMode, setEventsMode } = useEventsMode();
  const [sessionChecked, setSessionChecked] = useState(false);

  const eventAccent = getCurrentEventAccentColor();

  useEffect(() => {
    if (loading) return;
    if (member) {
      router.replace("/member/profile");
      return;
    }
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?redirect=" + encodeURIComponent("/account"));
        return;
      }
      setSessionChecked(true);
    };
    void check();
  }, [loading, member, router, supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Full page reload ensures session is fully cleared (important when switching guest ↔ member on mobile)
    window.location.href = "/";
  };

  if (loading || member || !sessionChecked) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (isKidsMode) {
    return (
      <div className="px-6 pt-6 pb-24 min-h-screen bg-[#F3EFEE]">
        <h1 className="text-2xl font-semibold text-[#193521] mb-6">Profile</h1>

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
                  Return to your Fairchild home
                </p>
              </div>
              <span className="text-white">→</span>
            </div>
          </button>

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
                  Return to your Fairchild home
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
                  Return to your Fairchild home
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
        <button
          onClick={handleLogout}
          className="text-red-500 underline text-sm"
        >
          Logout
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Account</h1>

      <div className="space-y-4">
        <Link
          href="/tickets/my"
          className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Your Tickets</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                View and manage your tickets
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
