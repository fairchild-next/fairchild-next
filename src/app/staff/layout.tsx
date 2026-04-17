"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/staff/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const { data: staff } = await supabase
        .from("staff")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!staff) {
        setAllowed(false);
        return;
      }
      setAllowed(true);
    }

    if (pathname === "/staff/login") {
      setAllowed(true);
      return;
    }
    check();
  }, [pathname, router]);

  if (pathname === "/staff/login") {
    return <>{children}</>;
  }

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <span className="text-[var(--text-muted)]">Checking access…</span>
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[var(--background)]">
        <p className="text-[var(--text-muted)] text-center">
          You don&apos;t have staff access. Contact your admin to be added.
        </p>
        <a href="/" className="text-[var(--primary)] hover:underline">
          ← Back to Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
