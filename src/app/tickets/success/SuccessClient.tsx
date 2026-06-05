"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";

export default function SuccessClient() {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order");

  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<
    "loading" | "paid" | "failed"
  >("loading");

  useEffect(() => {
    // Member reserve: orderId in URL, no Stripe session
    if (orderId) {
      clearCart();
      setStatus("paid");
      setTimeout(() => router.push("/tickets/my"), 1500);
      return;
    }

    if (!sessionId) {
      router.replace("/tickets");
      return;
    }

    if (!supabase) return;

    const verify = async () => {
      // Refresh session after returning from Stripe so auth persists
      await supabase.auth.refreshSession();
      const response = await fetch("/api/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        setStatus("failed");
        return;
      }

      const data = await response.json();

      if (data.status === "paid") {
        clearCart();
        setStatus("paid");

        setTimeout(() => {
          router.push("/tickets/my");
        }, 1500);
      } else {
        setStatus("failed");
      }
    };

    void verify();
  }, [sessionId, orderId, router, clearCart, supabase]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#6A8468] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Confirming your order…</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="font-serif text-xl font-semibold text-[#193521]">Payment Not Confirmed</h1>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          We could not confirm your payment. If you were charged, please contact us at{" "}
          <a href="mailto:info@fairchildgarden.org" className="underline">info@fairchildgarden.org</a>.
        </p>
        <a
          href="/tickets"
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#193521] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to Tickets
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-6 text-center">
      {/* Animated check circle */}
      <div className="w-16 h-16 rounded-full bg-[#d4e8d0] flex items-center justify-center">
        <svg className="w-8 h-8 text-[#193521]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <div className="space-y-1.5">
        <h1 className="font-serif text-2xl font-semibold text-[#193521]">
          You&apos;re all set!
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          Your tickets have been added to your wallet. Show your QR code at the garden entrance.
        </p>
      </div>

      <a
        href="/tickets/my"
        className="inline-flex items-center justify-center rounded-xl bg-[#193521] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 w-full max-w-xs"
      >
        View My Tickets
      </a>
      <a href="/" className="text-sm font-medium text-[#6A8468] hover:text-[#5a7360] transition">
        Back to Home
      </a>
    </div>
  );
}