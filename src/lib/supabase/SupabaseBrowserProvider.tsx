"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { pathRequiresAuth } from "@/lib/supabase/authRequiredPaths";

type SupabaseBrowserState = {
  client: SupabaseClient | null;
  /** True after mount once env has been read (client may still be null if env missing). */
  initialized: boolean;
};

const SupabaseBrowserContext = createContext<SupabaseBrowserState>({
  client: null,
  initialized: false,
});

function ProtectedSessionRedirect({ client }: { client: SupabaseClient | null }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    if (!client || !pathname) return;
    if (!pathRequiresAuth(pathname)) return;

    let cancelled = false;
    void client.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || session) return;
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname || "/")}`
      );
    });
    return () => {
      cancelled = true;
    };
  }, [client, pathname, router]);

  return null;
}

/**
 * Creates the Supabase browser client only after mount (client-only).
 * Avoids running createBrowserClient during SSG/SSR (e.g. /_not-found) when env may be unavailable.
 */
export function SupabaseBrowserProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      setClient(createBrowserClient(url, key));
    }
    setInitialized(true);
  }, []);

  return (
    <SupabaseBrowserContext.Provider value={{ client, initialized }}>
      <ProtectedSessionRedirect client={client} />
      {children}
    </SupabaseBrowserContext.Provider>
  );
}

export function useSupabaseBrowser(): SupabaseBrowserState {
  return useContext(SupabaseBrowserContext);
}

export function useSupabaseBrowserClient(): SupabaseClient | null {
  return useContext(SupabaseBrowserContext).client;
}

export function useSupabaseBrowserInitialized(): boolean {
  return useContext(SupabaseBrowserContext).initialized;
}
