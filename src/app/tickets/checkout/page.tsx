"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { siteConfig } from "@/lib/siteConfig";
import { useRouter } from "next/navigation";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import { useMember } from "@/lib/memberContext";
import CheckoutBarPortal from "@/components/CheckoutBarPortal";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { member } = useMember();
  const supabase = useSupabaseBrowserClient();

  const [addDonation, setAddDonation] = useState(false);
  const [memberWantsDonation, setMemberWantsDonation] = useState(false);
  const [memberDonationAmount, setMemberDonationAmount] = useState<number | null>(null);
  const [memberDonationCustom, setMemberDonationCustom] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    // Wait for persisted cart to hydrate before redirecting (avoids redirect on load before localStorage is read)
    const t = setTimeout(() => {
      if (items.length === 0) {
        router.replace("/tickets");
        return;
      }
    }, 100);
    return () => clearTimeout(t);
  }, [items.length, router]);

  useEffect(() => {
    if (items.length === 0 || !supabase) return;
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?redirect=" + encodeURIComponent("/tickets/checkout"));
      } else {
        setCheckingAuth(false);
      }
    };
    void checkAuth();
  }, [items.length, router, supabase]);

  if (items.length === 0) return null;
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const donationAmount = member
    ? (memberWantsDonation
        ? (memberDonationAmount ?? (memberDonationCustom ? parseFloat(memberDonationCustom) || 0 : 0))
        : 0)
    : addDonation ? 5 : 0;
  const total = subtotal + donationAmount;

  const isMemberReserve = total === 0 && member;

  const memberCap = siteConfig.memberTicketMaxPerReservation;
  const generalDailyTotal = items
    .filter((i) => i.productType === "general-daily")
    .reduce((s, i) => s + i.quantity, 0);
  const exceedsMemberCap =
    memberCap != null && generalDailyTotal > memberCap;

  const handleRedirectToPayment = async () => {
    if (exceedsMemberCap) return;
    if (isMemberReserve) {
      setReserving(true);
      try {
        const res = await fetch("/api/members/reserve", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              productType: i.productType,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              slotId: i.slotId,
              eventId: i.eventId,
              isPeak: i.isPeak,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Reserve failed");
        clearCart();
        router.replace("/tickets/success?order=" + data.orderId);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to reserve");
      } finally {
        setReserving(false);
      }
      return;
    }

    setCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          donation: donationAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Checkout failed:", data);
        alert(data.error || "Checkout failed");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28" id="checkout-content">
        <h1 className="text-xl font-semibold">Review & Checkout</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                </div>
                <div className="font-medium">
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!member && (
          <div className="border border-[var(--surface-border)] rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={addDonation}
                onChange={() => setAddDonation(!addDonation)}
                className="w-4 h-4"
              />
              <span className="text-sm text-[var(--text-primary)]">
                Add $5 to support Fairchild’s conservation work
              </span>
            </label>
          </div>
        )}

        {member && (
          <div className="border border-[var(--surface-border)] rounded-2xl p-4 bg-[var(--surface)]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={memberWantsDonation}
                onChange={() => {
                  setMemberWantsDonation(!memberWantsDonation);
                  if (memberWantsDonation) {
                    setMemberDonationAmount(null);
                    setMemberDonationCustom("");
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm text-[var(--text-primary)]">
                Want to donate to Fairchild&apos;s mission? Support conservation with a 100% tax-deductible contribution.
              </span>
            </label>
            {memberWantsDonation && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
              {[50, 25, 10, 5].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setMemberDonationAmount(memberDonationAmount === amt ? null : amt);
                    setMemberDonationCustom("");
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    memberDonationAmount === amt
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-border)] text-[var(--text-primary)] hover:bg-[var(--surface-border)]/80"
                  }`}
                >
                  ${amt}
                </button>
              ))}
              {subtotal > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMemberDonationAmount(memberDonationAmount === 1 ? null : 1);
                  setMemberDonationCustom("");
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  memberDonationAmount === 1
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-border)] text-[var(--text-primary)] hover:bg-[var(--surface-border)]/80"
                }`}
              >
                Round Up
              </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMemberDonationAmount(null);
                  setMemberDonationCustom(memberDonationCustom || " ");
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  memberDonationCustom
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-border)] text-[var(--text-primary)] hover:bg-[var(--surface-border)]/80"
                }`}
              >
                Custom
              </button>
              </div>
            {memberDonationCustom && (
              <div className="mt-3">
                <label className="block text-sm text-[var(--text-muted)] mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={memberDonationCustom === " " ? "" : memberDonationCustom}
                  onChange={(e) => setMemberDonationCustom(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--surface-border)] bg-[var(--background)] text-[var(--text-primary)]"
                />
              </div>
            )}
            </div>
            )}
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {donationAmount > 0 && (
            <div className="flex justify-between">
              <span>Conservation Support</span>
              <span>${donationAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Portaled to layout level – same position as cart Checkout button */}
      <CheckoutBarPortal>
        <div className="fixed bottom-20 left-0 right-0 z-[60] max-w-md mx-auto px-4 pt-4 pb-2 bg-[var(--surface)] border-t border-[var(--surface-border)]">
          {exceedsMemberCap && isMemberReserve && (
            <p className="text-sm text-amber-600 mb-2 text-center">
              Maximum {memberCap} tickets for member admission. Go back to cart to remove extra.
            </p>
          )}
          <button
            onClick={handleRedirectToPayment}
            disabled={reserving || checkingOut || exceedsMemberCap}
            className={`block w-full py-4 rounded-xl font-semibold text-center transition touch-manipulation whitespace-nowrap ${
              exceedsMemberCap
                ? "bg-[var(--surface-border)] text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--primary)] text-white opacity-100 active:opacity-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed [@media(hover:hover)]:hover:opacity-90"
            }`}
          >
            {isMemberReserve
              ? reserving
                ? "Reserving…"
                : "Reserve Tickets"
              : checkingOut
                ? "Redirecting…"
                : `Continue to Secure Payment · $${total.toFixed(2)}`}
          </button>
        </div>
      </CheckoutBarPortal>
    </div>
  );
}