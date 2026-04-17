"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import StaffBottomNav from "@/components/StaffBottomNav";
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
  const isStaffLogin = pathname.startsWith("/staff/login");
  const isCouple = pathname.startsWith("/couple");
  const hideGuestChrome = isStaff || isCouple;
  const showStaffNav = isStaff && !isStaffMapEditor && !isStaffLogin;

  return (
    <>
      <main
        className={
          isStaffMapEditor
            ? "flex min-h-0 w-full flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
            : showStaffNav
            ? "min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden pb-[calc(62px+env(safe-area-inset-bottom,0px))]"
            : hideGuestChrome
            ? "min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom,0px)]"
            : "min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden pb-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px))]"
        }
      >
        {children}
      </main>
      {showStaffNav && <StaffBottomNav />}
      {!hideGuestChrome && <BottomNav />}
      {!hideGuestChrome && <InstallPrompt />}
      {!hideGuestChrome && <CartCheckoutBar />}
      {!hideGuestChrome && <div id="checkout-bar-portal" />}
    </>
  );
}
