"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import CoupleNav from "@/components/couple/CoupleNav";
import type { PortalRole } from "@/lib/couple/types";

export default function CoupleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<PortalRole | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check if coordinator (staff)
      const { data: staffRow } = await supabase
        .from("staff")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (staffRow) {
        setRole("coordinator");
        return;
      }

      // Check if linked couple
      const { data: booking } = await supabase
        .from("wedding_bookings")
        .select("id")
        .eq("couple_user_id", user.id)
        .single();

      if (booking) {
        setRole("couple");
        return;
      }

      setRole("none");
    }

    check();
  }, [pathname, router]);

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf7f2" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
          <span className="text-stone-400 text-sm">Verifying access…</span>
        </div>
      </div>
    );
  }

  if (role === "none") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: "#faf7f2" }}>
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">💍</div>
          <h1 className="text-2xl font-serif text-stone-700 mb-2">Wedding Portal Access</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Your account isn't linked to a Fairchild wedding booking yet. Please contact your coordinator at{" "}
            <a href="mailto:weddings@fairchildgarden.org" className="text-amber-700 hover:underline">
              weddings@fairchildgarden.org
            </a>{" "}
            to get access.
          </p>
        </div>
        <a href="/" className="text-amber-700 text-sm hover:underline">
          ← Return to Fairchild
        </a>
      </div>
    );
  }

  // Redirect coordinator root to their dashboard
  if (role === "coordinator" && pathname === "/couple") {
    router.replace("/couple/coordinator");
  }

  // Redirect couple root to their dashboard
  if (role === "couple" && pathname === "/couple") {
    router.replace("/couple/dashboard");
  }

  // Guard: couples cannot access coordinator routes
  if (role === "couple" && pathname.startsWith("/couple/coordinator")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: "#faf7f2" }}>
        <p className="text-stone-500 text-sm">You don't have access to this section.</p>
        <a href="/couple/dashboard" className="text-amber-700 text-sm hover:underline">← Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <CoupleNav role={role} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
