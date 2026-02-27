"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();

  const [addDonation, setAddDonation] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/tickets");
    }
  }, [items, router]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const donationAmount = addDonation ? 5 : 0;
  const total = subtotal + donationAmount;

  const handleRedirectToPayment = async () => {
    const response = await fetch("/api/checkout", {
      method: "POST",
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
      alert(JSON.stringify(data));
      return;
    }

    window.location.href = data.checkoutUrl;
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={addDonation}
              onChange={() => setAddDonation(!addDonation)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              Add $5 to support Fairchild’s conservation work
            </span>
          </label>
        </div>

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

      <div className="sticky bottom-0 bg-white border-t p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleRedirectToPayment}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800"
        >
          Continue to Secure Payment · ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}