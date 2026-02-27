"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() =>
    createSupabaseBrowserClient()
  );

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      const search = window.location.search;

      // Handle magic link exchange
      if (search.includes("code=")) {
        await supabase.auth.exchangeCodeForSession(window.location.href);

        // Clean URL after exchange
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    };

    handleAuth();
  }, [supabase]);

  return <>{children}</>;
}