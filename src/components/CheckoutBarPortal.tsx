"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Portals children to #checkout-bar-portal (layout level) so the bar matches cart button position */
export default function CheckoutBarPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById("checkout-bar-portal"));
  }, []);

  if (!target) return null;
  return createPortal(children, target);
}
