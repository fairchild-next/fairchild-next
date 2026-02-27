"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import DailyTicketsContent from "./DailyTicketsContent";

export default function DailyTicketsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
      } else {
        setReady(true);
      }
    };

    checkSession();
  }, [router, supabase]);

  if (!ready) return null;

  return <DailyTicketsContent />;
}
