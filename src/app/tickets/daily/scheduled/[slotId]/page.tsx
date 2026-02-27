"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { createClient } from "@supabase/supabase-js";

interface TicketType {
  id: string;     // UUID from DB
  name: string;
  price: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ScheduledTicketSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const slotId = params?.slotId as string;

  const addItems = useCartStore((state) => state.addItems);

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // 🔹 Fetch ticket types from Supabase
  useEffect(() => {
    const fetchTicketTypes = async () => {
      const { data, error } = await supabase
        .from("ticket_types")
        .select("id, name, price")
        .eq("is_active", true);

      if (error) {
        console.error("Failed to load ticket types:", error);
        return;
      }

      if (data) {
        setTicketTypes(data);
      }
    };

    fetchTicketTypes();
  }, []);

  const updateQuantity = (ticketId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketId]: next };
    });
  };

  const total = ticketTypes.reduce((sum, ticket) => {
    const qty = quantities[ticket.id] || 0;
    return sum + qty * ticket.price;
  }, 0);

  const handleCheckout = () => {
    const selectedTickets = ticketTypes
      .filter((ticket) => (quantities[ticket.id] || 0) > 0)
      .map((ticket) => ({
        id: ticket.id,                  // ✅ REAL UUID
        productType: "scheduled-daily" as const,
        productId: ticket.id,           // ✅ REAL UUID
        name: ticket.name,
        price: ticket.price,
        quantity: quantities[ticket.id],
        slotId,                         // ✅ REAL slot UUID
      }));

    if (selectedTickets.length === 0) return;

    addItems(selectedTickets);
    router.push("/tickets/cart");
  };

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <h1 className="text-xl font-semibold">
          Select Your Tickets
        </h1>

        {ticketTypes.map((ticket) => {
          const quantity = quantities[ticket.id] || 0;

          return (
            <div
              key={ticket.id}
              className="flex items-center justify-between border rounded-lg p-4"
            >
              <div>
                <div className="font-medium">{ticket.name}</div>
                <div className="text-sm text-gray-500">
                  ${ticket.price.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(ticket.id, -1)}
                  className="w-8 h-8 rounded-full bg-gray-200"
                >
                  –
                </button>

                <span className="w-6 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => updateQuantity(ticket.id, 1)}
                  className="w-8 h-8 rounded-full bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <button
          onClick={handleCheckout}
          disabled={total === 0}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            total === 0
              ? "bg-gray-300 text-gray-500"
              : "bg-green-700 text-white"
          }`}
        >
          Continue to Cart · ${total.toFixed(2)}
        </button>
      </div>

    </div>
  );
}