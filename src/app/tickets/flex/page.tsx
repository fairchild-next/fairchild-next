"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TicketSelector from "@/components/TicketSelector";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";

type TicketType = {
  id: string;
  name: string;
  price: number;
  price_peak: number | null;
};

export default function FlexTicketPage() {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPeak, setIsPeak] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase
      .from("ticket_types")
      .select("id, name, price, price_peak")
      .eq("is_active", true)
      .is("event_id", null)
      .then(({ data, error }: { data: TicketType[] | null; error: unknown }) => {
        if (cancelled) return;
        if (!error && data) setTicketTypes(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Flex = scheduled + $5 for same day type (weekday/off-peak or weekend/peak)
  const FLEX_UPCHARGE = 5;
  const tickets = ticketTypes.map((t) => {
    const scheduledPrice = isPeak && t.price_peak != null ? t.price_peak : t.price;
    return {
      id: t.id,
      label: t.name,
      price: scheduledPrice + FLEX_UPCHARGE,
    };
  });

  return (
    <div>
      <div className="px-6 pt-4">
        <button
          onClick={() => router.push("/tickets/daily")}
          className="text-[var(--primary)] text-sm font-medium"
        >
          ← Back
        </button>
      </div>
      {loading ? (
        <div className="px-6 py-8 text-[var(--text-muted)]">
          Loading ticket types...
        </div>
      ) : ticketTypes.length === 0 ? (
        <div className="px-6 py-8 space-y-4">
          <p className="text-[var(--text-muted)]">
            No ticket types available at the moment.
          </p>
          <button
            onClick={() => router.push("/tickets/daily")}
            className="text-[var(--primary)] text-sm font-medium"
          >
            ← Back to Daily Admission
          </button>
        </div>
      ) : (
        <div className="pb-8">
          <h2 className="text-xl font-semibold px-6 pt-4 pb-1">
            Daily Admission – Flex
          </h2>
          <p className="text-[var(--text-muted)] text-sm px-6 pb-3">
            Choose a ticket type, then select peak or off-peak:
          </p>
          <div className="flex gap-2 px-6 pb-4">
            <button
              onClick={() => setIsPeak(false)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition ${
                !isPeak
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
              }`}
            >
              Off-Peak (Weekdays) Mon–Fri
            </button>
            <button
              onClick={() => setIsPeak(true)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition ${
                isPeak
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
              }`}
            >
              Peak (Weekends) Sat–Sun
            </button>
          </div>
          <TicketSelector
            title=""
            tickets={tickets}
            productType="flex"
            isPeak={isPeak}
            showPeakPriceStyle={isPeak}
            inlineSummary
            onContinue={() => router.push("/tickets/cart")}
          />
        </div>
      )}
    </div>
  );
}