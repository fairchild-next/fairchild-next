"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Renders the fixed checkout bar at layout level (outside scrollable main)
 * so it's never affected by overflow/stacking. Only visible on /tickets/cart.
 * Uses button + router.push for reliable mobile touch handling.
 */
export default function CartCheckoutBar() {
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((state) => state.items);

  if (pathname !== "/tickets/cart") return null;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const hasItems = items.length > 0;

  const memberCap = siteConfig.memberTicketMaxPerReservation;
  const generalDailyTotal = items
    .filter((i) => i.productType === "general-daily")
    .reduce((s, i) => s + i.quantity, 0);
  const exceedsMemberCap =
    memberCap != null && generalDailyTotal > memberCap;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[60] max-w-md mx-auto px-4 pt-4 pb-2 bg-[var(--surface)] border-t border-[var(--surface-border)] pointer-events-auto">
      {exceedsMemberCap && (
        <p className="text-sm text-amber-600 mb-2 text-center">
          Maximum {memberCap} tickets for member admission. Remove extra to continue.
        </p>
      )}
      {hasItems ? (
        <button
          type="button"
          onClick={() => !exceedsMemberCap && router.push("/tickets/checkout")}
          disabled={exceedsMemberCap}
          className={`block w-full py-4 rounded-xl font-semibold text-center transition touch-manipulation [@media(hover:hover)]:hover:opacity-90 ${
            exceedsMemberCap
              ? "bg-[var(--surface-border)] text-[var(--text-muted)] cursor-not-allowed"
              : "bg-[var(--primary)] text-white opacity-100 active:opacity-95 cursor-pointer"
          }`}
        >
          Checkout · ${total.toFixed(2)}
        </button>
      ) : (
        <div className="w-full py-4 rounded-xl bg-[var(--surface-border)] text-[var(--text-muted)] font-semibold text-center cursor-not-allowed">
          Checkout · $0.00
        </div>
      )}
    </div>
  );
}
