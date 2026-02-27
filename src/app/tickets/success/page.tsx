"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");

  useEffect(() => {
    if (!sessionId) {
      router.replace("/tickets");
      return;
    }

    const verify = async () => {
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
        setStatus("paid");
        clearCart();

        // Auto redirect to My Tickets after 2 seconds
        setTimeout(() => {
          router.replace("/tickets/my");
        }, 2000);
      } else {
        setStatus("failed");
      }
    };

    verify();
  }, [sessionId, router, clearCart]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p>Verifying your payment...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold text-red-600">
          Payment Not Confirmed
        </h1>
        <button
          onClick={() => router.push("/tickets")}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 text-center">
      <div className="text-4xl">🌿</div>
      <h1 className="text-xl font-semibold">Payment Successful!</h1>
      <p>Your tickets are ready.</p>
      <p className="text-sm text-gray-500">
        Redirecting you to your tickets...
      </p>
    </div>
  );
}