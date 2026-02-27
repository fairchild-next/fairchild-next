"use client";

import { useEffect, useState } from "react";

export default function WalletPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const res = await fetch("/api/my-tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    };

    fetchTickets();
  }, []);

  if (tickets.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Your Wallet</h1>
        <p className="text-gray-500 mt-4">No tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Your Wallet</h1>

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="border rounded-lg p-4 space-y-1"
        >
          <div className="font-medium">{ticket.name}</div>
          <div className="text-sm text-gray-500">
            Quantity: {ticket.quantity}
          </div>
          {ticket.slot_id && (
            <div className="text-sm text-gray-500">
              Slot: {ticket.slot_id}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}