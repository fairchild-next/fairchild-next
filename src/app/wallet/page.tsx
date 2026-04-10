"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseBrowser } from "@/lib/supabase/SupabaseBrowserProvider";

export default function WalletPage() {
  const router = useRouter();
  const { client: supabase, initialized } = useSupabaseBrowser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    if (!supabase) {
      router.replace("/login?redirect=" + encodeURIComponent("/wallet"));
      setReady(true);
      return;
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?redirect=" + encodeURIComponent("/wallet"));
      } else {
        router.replace("/tickets/my");
      }
      setReady(true);
    });
  }, [initialized, supabase, router]);

  if (!initialized || !ready) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex items-center justify-center min-h-[200px]">
      <p className="text-[var(--text-muted)]">Redirecting…</p>
    </div>
  );
}
