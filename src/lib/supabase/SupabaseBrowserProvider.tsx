"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SupabaseBrowserContext = createContext<SupabaseClient | null>(null);

/**
 * Creates the Supabase browser client only after mount (client-only).
 * Avoids running createBrowserClient during SSG/SSR (e.g. /_not-found) when env may be unavailable.
 */
export function SupabaseBrowserProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    setClient(createBrowserClient(url, key));
  }, []);

  return (
    <SupabaseBrowserContext.Provider value={client}>
      {children}
    </SupabaseBrowserContext.Provider>
  );
}

export function useSupabaseBrowserClient(): SupabaseClient | null {
  return useContext(SupabaseBrowserContext);
}
