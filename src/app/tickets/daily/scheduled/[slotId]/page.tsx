"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";

interface TicketType {
  id: string;
  name: string;
  price: number;
  price_peak: number | null;
}

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

function formatGuaranteedDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ScheduledTicketSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const slotId = params?.slotId as string;
  const supabase = useSupabaseBrowserClient();

  const addItems = useCartStore((state) => state.addItems);

  const [slot, setSlot] = useState<Slot | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!slotId || !supabase) return;
    const fetchSlot = async () => {
      const { data } = await supabase
        .from("time_slots")
        .select("id, date, start_time, end_time")
        .eq("id", slotId)
        .single();
      if (data) setSlot(data as Slot);
    };
    void fetchSlot();
  }, [slotId, supabase]);

  useEffect(() => {
    if (!supabase) return;
    const fetchTicketTypes = async () => {
      const { data, error } = await supabase
        .from("ticket_types")
        .select("id, name, price, price_peak")
        .eq("is_active", true)
        .is("event_id", null);

      if (error) {
        console.error("Failed to load ticket types:", error);
        return;
      }

      if (data) {
        setTicketTypes(data);
      }
    };

    void fetchTicketTypes();
  }, [supabase]);

  // Sat/Sun = peak; Mon–Fri = off-peak
  const isPeak = slot
    ? (() => {
        const d = new Date(slot.date + "T12:00:00");
        const day = d.getDay();
        return day === 0 || day === 6;
      })()
    : false;

  const updateQuantity = (ticketId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketId]: next };
    });
  };

  const getPrice = (t: TicketType) =>
    isPeak && t.price_peak != null ? t.price_peak : t.price;

  const total = ticketTypes.reduce((sum, ticket) => {
    const qty = quantities[ticket.id] || 0;
    return sum + qty * getPrice(ticket);
  }, 0);

  const handleCheckout = () => {
    const selectedTickets = ticketTypes
      .filter((ticket) => (quantities[ticket.id] || 0) > 0)
      .map((ticket) => ({
        id: `scheduled-daily-${ticket.id}-${slotId}`,
        productType: "scheduled-daily" as const,
        productId: ticket.id,
        name: ticket.name,
        price: getPrice(ticket),
        quantity: quantities[ticket.id],
        slotId,
      }));

    if (selectedTickets.length === 0) return;

    addItems(selectedTickets);
    router.push("/tickets/cart");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Scheduled admission hero image with dynamic date overlay */}
        <div className="relative aspect-[2/1] w-full overflow-hidden">
          <img
            src="/scheduled-admission-hero.png"
            alt="Fairchild Tropical Botanic Garden"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {slot && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 text-white">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">
                  Guaranteed entry for {formatGuaranteedDate(slot.date)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-6 bg-[var(--background)]">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Select Your Tickets
          </h1>

          {slot && (
            <p className="text-sm text-[var(--text-muted)]">
              Enter at your scheduled time. A 30-minute grace period applies after your slot ends.
            </p>
          )}

        {ticketTypes.map((ticket) => {
          const quantity = quantities[ticket.id] || 0;

          return (
            <div
              key={ticket.id}
              className="flex items-center justify-between border border-[var(--surface-border)] rounded-xl p-4"
            >
              <div>
                <div className="font-medium text-[var(--text-primary)]">{ticket.name}</div>
                <div
                  className={`text-sm ${isPeak ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}
                >
                  ${getPrice(ticket).toFixed(2)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(ticket.id, -1)}
                  className="w-10 h-10 rounded-full bg-[var(--surface-border)] text-[var(--text-primary)] flex items-center justify-center"
                >
                  –
                </button>

                <span className="w-6 text-center text-[var(--text-primary)]">
                  {quantity}
                </span>

                <button
                  onClick={() => updateQuantity(ticket.id, 1)}
                  className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-[var(--surface)] border-t border-[var(--surface-border)] p-4 pb-20">
        <button
          onClick={handleCheckout}
          disabled={total === 0}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            total === 0
              ? "bg-[var(--surface-border)] text-[var(--text-muted)]"
              : "bg-[var(--primary)] text-white"
          }`}
        >
          Continue to Cart · ${total.toFixed(2)}
        </button>
      </div>

    </div>
  );
}