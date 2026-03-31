"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMember } from "@/lib/memberContext";
import { useKidsMode } from "@/lib/kidsModeContext";
import { useWeddingMode } from "@/lib/weddingModeContext";
import { useEventsMode } from "@/lib/eventsModeContext";
import KidsBadges from "@/components/kids/KidsBadges";

export default function BadgesPage() {
  const router = useRouter();
  const { hasSession, authReady, loading } = useMember();
  const { isKidsMode } = useKidsMode();
  const { isWeddingMode } = useWeddingMode();
  const { isEventsMode } = useEventsMode();

  useEffect(() => {
    if (!authReady || loading) return;
    if (isWeddingMode && hasSession) {
      router.replace("/wedding/gallery");
      return;
    }
    if (isEventsMode && hasSession) {
      router.replace("/learn");
      return;
    }
    if (!isKidsMode || !hasSession) {
      router.replace("/learn");
    }
  }, [authReady, loading, isKidsMode, isWeddingMode, isEventsMode, hasSession, router]);

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (isWeddingMode && hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Redirecting…</p>
      </div>
    );
  }

  if (isEventsMode && hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Redirecting…</p>
      </div>
    );
  }

  if (!isKidsMode || !hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Redirecting…</p>
      </div>
    );
  }

  return <KidsBadges />;
}
