"use client";

import { useEffect } from "react";
import {
  SupabaseBrowserProvider,
  useSupabaseBrowserClient,
} from "@/lib/supabase/SupabaseBrowserProvider";
import { MemberProvider } from "@/lib/memberContext";
import { KidsModeProvider } from "@/lib/kidsModeContext";
import { WeddingModeProvider } from "@/lib/weddingModeContext";
import { EventsModeProvider } from "@/lib/eventsModeContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

function AuthCodeExchange({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    const search = window.location.search;
    if (!search.includes("code=")) return;

    const handleAuth = async () => {
      await supabase.auth.exchangeCodeForSession(window.location.href);
      window.history.replaceState({}, document.title, window.location.pathname);
    };
    void handleAuth();
  }, [supabase]);

  return <>{children}</>;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseBrowserProvider>
      <AuthCodeExchange>
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
      </AuthCodeExchange>
    </SupabaseBrowserProvider>
  );
}
