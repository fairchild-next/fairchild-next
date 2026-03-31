"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMember } from "@/lib/memberContext";
import { useEventsMode } from "@/lib/eventsModeContext";

export default function EventsModeGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { member, hasSession, authReady } = useMember();
  const { isEventsMode } = useEventsMode();

  useEffect(() => {
    if (!authReady) return;
    if (!hasSession || !isEventsMode) {
      router.replace(member ? "/member/profile" : "/account");
    }
  }, [authReady, hasSession, member, isEventsMode, router]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (!hasSession || !isEventsMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-[var(--text-muted)]">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
