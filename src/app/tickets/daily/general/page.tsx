"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";

type TimeSlot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
};

type TicketType = {
  id: string;
  name: string;
  price: number;
};

export default function TicketTypePage() {
  const { slotId } = useParams();
  const supabase = useSupabaseBrowserClient();

  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!slotId || !supabase) return;

    const fetchData = async () => {
      const { data: slotData } = await supabase
        .from("time_slots")
        .select("*")
        .eq("id", slotId)
        .single();

      if (slotData) setSlot(slotData);

      const { data: typesData } = await supabase
        .from("ticket_types")
        .select("id, name, price")
        .eq("is_active", true);

      if (typesData) {
        setTicketTypes(typesData);

        const initial: Record<string, number> = {};
        typesData.forEach((t) => {
          initial[t.id] = 0;
        });

        setQuantities(initial);
      }
    };

    void fetchData();
  }, [slotId, supabase]);

  const changeQuantity = (id: string, change: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const updated = Math.max(0, current + change);

      return {
        ...prev,
        [id]: updated,
      };
    });
  };

  const totalItems = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  const total = ticketTypes.reduce(
    (sum, t) => sum + t.price * (quantities[t.id] || 0),
    0
  );

  if (!supabase) {
    return (
      <div className="max-w-md mx-auto px-6 pt-6">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (!slot) return null;

  return (
    <div className="max-w-md mx-auto px-6 pt-6 space-y-8">
      {/* Slot Header */}
      <div>
        <h2 className="text-xl font-semibold">
          {slot.date} | {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
        </h2>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-6">
        {ticketTypes.map((type) => (
          <div
            key={type.id}
            className="border border-[var(--surface-border)] rounded-2xl p-6 transition hover:border-[var(--primary)]"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-medium">{type.name}</div>
                <div className="text-gray-400 mt-1">${type.price}</div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => changeQuantity(type.id, -1)}
                  className="w-10 h-10 rounded-full bg-[var(--surface-border)] text-[var(--text-primary)] flex items-center justify-center text-lg"
                >
                  –
                </button>

                <span className="w-8 text-center text-lg">
                  {quantities[type.id] ?? 0}
                </span>

                <button
                  type="button"
                  onClick={() => changeQuantity(type.id, 1)}
                  className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-[var(--surface)] border-t border-[var(--surface-border)] px-6 py-5">
        <div className="flex justify-between text-sm text-[var(--text-muted)] mb-3">
          <span>{totalItems} Tickets</span>
          <span className="font-medium text-white">${total}</span>
        </div>

        <button
          type="button"
          disabled={totalItems === 0}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition ${
            totalItems === 0
              ? "bg-[var(--surface-border)] text-[var(--text-muted)]"
              : "bg-[var(--primary)] text-white hover:opacity-90"
          }`}
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
}
