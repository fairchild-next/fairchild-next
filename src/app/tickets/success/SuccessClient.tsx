"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";

export default function SuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<
    "loading" | "paid" | "failed"
  >("loading");

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
        clearCart();
        setStatus("paid");

        setTimeout(() => {
          router.push("/tickets/my");
        }, 1500);
      } else {
        setStatus("failed");
      }
    };

    verify();
  }, [sessionId, router, clearCart]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p>Verifying your order…</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <h1 className="text-xl font-semibold text-red-600">
          Payment Not Confirmed
        </h1>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">🌿</div>
        <h1 className="text-xl font-semibold">
          You're All Set!
        </h1>
        <p>Your tickets are being added to your wallet.</p>
      </div>
    </div>
  );
}