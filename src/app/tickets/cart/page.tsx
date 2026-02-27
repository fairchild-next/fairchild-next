"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">Your Cart</h1>

        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            {item.name} × {item.quantity}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <button
          onClick={() => router.push("/tickets/checkout")}
          disabled={total === 0}
          className="w-full py-3 rounded-lg bg-green-700 text-white font-semibold"
        >
          Checkout · ${total.toFixed(2)}
        </button>
      </div>

    </div>
  );
}