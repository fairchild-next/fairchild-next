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
  productType?: "flex" | "general-daily" | "special-event";
  /** For flex: true = weekend/peak (prices in green), false = weekday/off-peak */
  isPeak?: boolean;
  /** When true, show price in green (peak pricing) */
  showPeakPriceStyle?: boolean;
  /** When true, summary/button inline (no floating); fits all on screen */
  inlineSummary?: boolean;
  /** For special-event: event uuid */
  eventId?: string;
  /** Optional cap on total tickets (site-specific, e.g. Fairchild: 4 for member + 3 guests) */
  maxTotalItems?: number | null;
  onContinue?: (
    total: number,
    quantities: Record<string, number>
  ) => void;
};

export default function TicketSelector({
  title,
  tickets,
  productType = "flex",
  isPeak = false,
  showPeakPriceStyle = false,
  inlineSummary = false,
  eventId,
  maxTotalItems = null,
  onContinue,
}: Props) {
  const { items, addItems, updateQuantity, removeItem } =
    useCartStore();

  const relevantItems = items.filter((i) => {
    if (!productType || i.productType !== productType) return false;
    if (productType === "flex") return i.isPeak === isPeak;
    if (productType === "special-event") return i.eventId === eventId;
    return true;
  });

  const getQuantity = (ticketId: string) => {
    return (
      relevantItems.find((i) => i.productId === ticketId)
        ?.quantity || 0
    );
  };

  const changeQuantity = (
    ticket: TicketType,
    change: number
  ) => {
    const existingItem = items.find(
      (i) =>
        i.productId === ticket.id &&
        i.productType === productType &&
        (productType !== "flex" || i.isPeak === isPeak) &&
        (productType !== "special-event" || i.eventId === eventId)
    );

    const current = existingItem?.quantity || 0;
    const currentTotal = relevantItems.reduce((s, i) => s + i.quantity, 0);
    const effectiveChange =
      maxTotalItems != null && change > 0
        ? Math.min(change, maxTotalItems - currentTotal)
        : change;
    const newQuantity = Math.max(0, current + effectiveChange);

    if (!existingItem && newQuantity > 0) {
      addItems([
        {
          id:
            productType === "flex"
              ? `flex-${ticket.id}-${isPeak}`
              : productType === "special-event" && eventId
                ? `special-event-${eventId}-${ticket.id}`
                : `${productType}-${ticket.id}`,
          productType,
          productId: ticket.id,
          name: ticket.label,
          price: ticket.price,
          quantity: newQuantity,
          ...(productType === "flex" && { isPeak }),
          ...(productType === "special-event" && eventId && { eventId }),
        },
      ]);
    } else if (existingItem) {
      if (newQuantity === 0) {
        removeItem(existingItem.id);
      } else {
        updateQuantity(existingItem.id, newQuantity);
      }
    }
  };

  const total = relevantItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = relevantItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const quantities: Record<string, number> = {};
  relevantItems.forEach((item) => {
    quantities[item.productId] = item.quantity;
  });

  const summaryBlock = (
    <div
      className={
        inlineSummary
          ? "border-t border-[var(--surface-border)] pt-4 mt-4"
          : "fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-[var(--surface)] border-t border-[var(--surface-border)] px-6 py-5"
      }
    >
      <div className="flex justify-between mb-3 text-[var(--text-primary)]">
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
            ? "bg-[var(--surface-border)] text-[var(--text-muted)]"
            : "bg-[var(--primary)] text-white"
        }`}
      >
        Continue
      </button>
    </div>
  );

  return (
    <div
      className={
        inlineSummary
          ? "px-6 pb-8 pt-2 max-w-md mx-auto min-h-0"
          : "px-6 pb-32 pt-2 max-w-md mx-auto"
      }
    >
      {title ? (
        <h2 className="text-2xl font-semibold mb-8 border-b border-[var(--surface-border)] pb-4 text-[var(--text-primary)]">
          {title}
        </h2>
      ) : null}

      <div className={inlineSummary ? "space-y-3" : "space-y-6"}>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={
              inlineSummary
                ? "border border-[var(--surface-border)] rounded-xl p-4"
                : "border border-[var(--surface-border)] rounded-2xl p-6"
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <div className={`${inlineSummary ? "text-base font-medium" : "text-lg font-medium"} text-[var(--text-primary)]`}>
                  {ticket.label}
                </div>
                <div className={`mt-0.5 ${showPeakPriceStyle ? "text-[var(--primary)]" : "text-[var(--text-muted)]"} ${inlineSummary ? "text-sm" : ""}`}>
                  ${ticket.price}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    changeQuantity(ticket, -1)
                  }
                  className={`${inlineSummary ? "w-8 h-8" : "w-10 h-10"} rounded bg-[var(--surface-border)] text-[var(--text-primary)]`}
                >
                  –
                </button>

                <span className="w-5 text-center text-sm text-[var(--text-primary)]">
                  {getQuantity(ticket.id)}
                </span>

                <button
                  onClick={() => changeQuantity(ticket, 1)}
                  disabled={
                    maxTotalItems != null &&
                    relevantItems.reduce((s, i) => s + i.quantity, 0) >= maxTotalItems
                  }
                  className={`${inlineSummary ? "w-8 h-8" : "w-10 h-10"} rounded bg-[var(--primary)] text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {summaryBlock}
    </div>
  );
}