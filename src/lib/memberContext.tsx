"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";

export type MemberInfo = {
  id: string;
  member_id: string;
  membership_type: string;
  display_name: string | null;
  expires_at: string;
};

type MemberContextValue = {
  member: MemberInfo | null;
  loading: boolean;
  refetch: () => void;
  /** True when Supabase has an active session (member or logged-in guest). */
  hasSession: boolean;
  /** False until the first auth session check completes. */
  authReady: boolean;
};

const MemberContext = createContext<MemberContextValue>({
  member: null,
  loading: true,
  refetch: () => {},
  hasSession: false,
  authReady: false,
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const supabase = useSupabaseBrowserClient();

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members/me", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setMember(data.member ?? null);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    refetch();
  }, [supabase, refetch]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!cancelled) {
        setHasSession(!!data.session);
        setAuthReady(true);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setHasSession(!!session);
      setAuthReady(true);
      refetch();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, refetch]);

  return (
    <MemberContext.Provider
      value={{ member, loading, refetch, hasSession, authReady }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  return useContext(MemberContext);
}
