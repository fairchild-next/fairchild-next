"use client";

import { useCartStore } from "@/lib/store/cartStore";

type TicketType = {
  id: string;
  label: string;
  price: number;
};

type Props = {
  title: string;
  tickets: TicketType[];
  onContinue?: (
    total: number,
    quantities: Record<string, number>
  ) => void;
};

export default function TicketSelector({
  title,
  tickets,
  onContinue,
}: Props) {
  const { items, updateItem } = useCartStore();

  const getQuantity = (id: string) => {
    return items.find((i) => i.ticketTypeId === id)?.quantity || 0;
  };

  const changeQuantity = (ticket: TicketType, change: number) => {
    const current = getQuantity(ticket.id);
    const newQuantity = Math.max(0, current + change);

    updateItem({
      ticketTypeId: ticket.id,
      name: ticket.label,
      price: ticket.price,
      quantity: newQuantity,
    });
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const quantities: Record<string, number> = {};
  items.forEach((item) => {
    quantities[item.ticketTypeId] = item.quantity;
  });

  return (
    <div className="px-6 pb-32 pt-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-8 border-b border-gray-700 pb-4">
        {title}
      </h2>

      <div className="space-y-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border border-gray-700 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-medium">
                  {ticket.label}
                </div>
                <div className="text-gray-400 mt-1">
                  ${ticket.price}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => changeQuantity(ticket, -1)}
                  className="w-10 h-10 rounded bg-gray-700"
                >
                  –
                </button>

                <span className="w-6 text-center">
                  {getQuantity(ticket.id)}
                </span>

                <button
                  onClick={() => changeQuantity(ticket, 1)}
                  className="w-10 h-10 rounded bg-green-500 text-black"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-black border-t border-gray-700 px-6 py-5">
        <div className="flex justify-between mb-3">
          <span>{totalItems} Tickets</span>
          <span>${total}</span>
        </div>

        <button
          disabled={totalItems === 0}
          onClick={() => {
            if (onContinue) {
              onContinue(total, quantities);
            }
          }}
          className={`w-full py-4 rounded-2xl font-semibold ${
            totalItems === 0
              ? "bg-gray-700 text-gray-400"
              : "bg-green-500 text-black"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}