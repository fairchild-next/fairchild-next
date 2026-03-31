"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMember } from "@/lib/memberContext";
import { useWeddingMode } from "@/lib/weddingModeContext";

export default function WeddingModeGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { member, hasSession, authReady } = useMember();
  const { isWeddingMode } = useWeddingMode();

  useEffect(() => {
    if (!authReady) return;
    if (!hasSession || !isWeddingMode) {
      router.replace(member ? "/member/profile" : "/account");
    }
  }, [authReady, hasSession, member, isWeddingMode, router]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (!hasSession || !isWeddingMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-[var(--text-muted)]">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
