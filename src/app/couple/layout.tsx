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

      const { data: staffRow } = await supabase
        .from("staff").select("id").eq("user_id", user.id).single();
      if (staffRow) { setRole("coordinator"); return; }

      const { data: booking } = await supabase
        .from("wedding_bookings").select("id").eq("couple_user_id", user.id).single();
      if (booking) { setRole("couple"); return; }

      setRole("none");
    }

    check();
  }, [pathname, router]);

  if (role === null) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#f0f3ee" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
          <span className="text-[#7a907a] text-sm">Verifying access…</span>
        </div>
      </div>
    );
  }

  if (role === "none") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8" style={{ background: "#f0f3ee" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">💍</div>
          <h1 className="font-serif text-xl text-[#2a3d2a] mb-2">Wedding Portal Access</h1>
          <p className="text-[#7a907a] text-sm leading-relaxed">
            Your account isn't linked to a Fairchild wedding booking yet. Contact your coordinator at{" "}
            <a href="mailto:weddings@fairchildgarden.org" className="text-[#4a6741] hover:underline">
              weddings@fairchildgarden.org
            </a>
          </p>
        </div>
        <a href="/" className="text-[#4a6741] text-sm hover:underline">← Return to Fairchild</a>
      </div>
    );
  }

  if (role === "couple" && pathname.startsWith("/couple/coordinator")) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6" style={{ background: "#f0f3ee" }}>
        <p className="text-[#7a907a] text-sm">You don't have access to this section.</p>
        <a href="/couple/dashboard" className="text-[#4a6741] text-sm hover:underline">← Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: "#f0f3ee" }}>
      {/* Bottom padding accounts for the fixed nav height */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </div>
      <CoupleNav role={role} />
    </div>
  );
}
