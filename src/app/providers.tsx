"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MemberProvider } from "@/lib/memberContext";
import { KidsModeProvider } from "@/lib/kidsModeContext";
import { WeddingModeProvider } from "@/lib/weddingModeContext";
import { EventsModeProvider } from "@/lib/eventsModeContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() =>
    createSupabaseBrowserClient()
  );

  useEffect(() => {
    const search = window.location.search;
    if (!search.includes("code=")) return;

    const handleAuth = async () => {
      await supabase.auth.exchangeCodeForSession(window.location.href);
      window.history.replaceState({}, document.title, window.location.pathname);
    };
    handleAuth();
  }, [supabase]);

  return (
    <MemberProvider>
      <KidsModeProvider>
        <WeddingModeProvider>
          <EventsModeProvider>
            <ServiceWorkerRegistration />
            {children}
          </EventsModeProvider>
        </WeddingModeProvider>
      </KidsModeProvider>
    </MemberProvider>
  );
}