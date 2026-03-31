"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KidsDiscoveriesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/badges?tab=discoveries");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3EFEE]">
      <p className="text-[var(--text-muted)]">Loading…</p>
    </div>
  );
}
