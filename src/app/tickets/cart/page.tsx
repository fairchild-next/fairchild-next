"use client";

import Link from "next/link";
import { ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "@/lib/store/cartStore";
import { siteConfig } from "@/lib/siteConfig";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const memberCap = siteConfig.memberTicketMaxPerReservation;
  const generalDailyTotal = items
    .filter((i) => i.productType === "general-daily")
    .reduce((s, i) => s + i.quantity, 0);
  const atMemberCap = memberCap != null && generalDailyTotal >= memberCap;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#d4e8d0] flex items-center justify-center">
          <ShoppingCart size={26} weight="duotone" className="text-[#193521]" />
        </div>
        <p className="font-serif text-lg font-semibold text-[#193521]">Your cart is empty</p>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          Add tickets for your visit and they&apos;ll appear here.
        </p>
        <Link
          href="/tickets"
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#193521] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Browse Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-3">
        <h1 className="text-xl font-semibold text-[#193521] font-serif px-1 mb-4">Your Cart</h1>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border-2 border-[#6A8468]/20"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#193521]">{item.name}</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                ${item.price.toFixed(2)} each
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
                className="w-8 h-8 rounded-lg border border-[#6A8468]/30 text-[#193521] flex items-center justify-center text-lg font-medium hover:bg-[#f3efee] transition"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span className="w-7 text-center text-sm font-semibold text-[#193521]">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.productType === "general-daily" && atMemberCap}
                className="w-8 h-8 rounded-lg bg-[#193521] text-white flex items-center justify-center text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
                aria-label="Increase quantity"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-red-500 flex items-center justify-center text-base transition"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Order summary */}
        <div className="mt-4 rounded-2xl border border-[#6A8468]/20 bg-white px-4 py-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-[#e8e4de] pt-2 mt-2 flex justify-between font-semibold text-[#193521]">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] pt-1">
            Optional conservation donation added on next step.
          </p>
        </div>
      </div>
      {/* Checkout bar rendered at layout level (CartCheckoutBar) */}
    </div>
  );
}