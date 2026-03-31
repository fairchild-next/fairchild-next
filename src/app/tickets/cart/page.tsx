"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { siteConfig } from "@/lib/siteConfig";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const memberCap = siteConfig.memberTicketMaxPerReservation;
  const generalDailyTotal = items
    .filter((i) => i.productType === "general-daily")
    .reduce((s, i) => s + i.quantity, 0);
  const atMemberCap = memberCap != null && generalDailyTotal >= memberCap;

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-28">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Your Cart</h1>

        {items.length === 0 ? (
          <p className="text-[var(--text-muted)]">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    item.quantity <= 1
                      ? removeItem(item.id)
                      : updateQuantity(item.id, item.quantity - 1)
                  }
                  className="w-8 h-8 rounded-lg bg-[var(--surface-border)] text-[var(--text-primary)] flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span className="w-6 text-center text-sm font-medium text-[var(--text-primary)]">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={
                    item.productType === "general-daily" && atMemberCap
                  }
                  className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[var(--text-muted)] hover:text-red-500 text-sm p-1"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Checkout bar rendered at layout level (CartCheckoutBar) */}
    </div>
  );
}