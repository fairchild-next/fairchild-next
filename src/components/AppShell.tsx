"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";
import CartCheckoutBar from "@/components/CartCheckoutBar";

/**
 * Visitor chrome (bottom nav, checkout bar, install prompt) is hidden on /staff/*
 * so tools are not clipped and staff UIs can use full height.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isStaff = pathname.startsWith("/staff");
  const isStaffMapEditor = pathname.startsWith("/staff/map/edit");

  return (
    <>
      <main
        className={
          isStaff
            ? isStaffMapEditor
              ? "flex min-h-0 w-full flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
              : "min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom,0px)]"
            : "min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden pb-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px))]"
        }
      >
        {children}
      </main>
      {!isStaff && <BottomNav />}
      {!isStaff && <InstallPrompt />}
      {!isStaff && <CartCheckoutBar />}
      {!isStaff && <div id="checkout-bar-portal" />}
    </>
  );
}
