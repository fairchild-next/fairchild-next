"use client";

import { usePathname } from "next/navigation";

/**
 * Controls the root container width/layout.
 * - Guest/member/staff: narrow mobile shell (max-w-[28rem])
 * - Couple portal (/couple/*): full-width desktop-friendly layout
 */
export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isCouple = pathname.startsWith("/couple");

  if (isCouple) {
    return (
      <div className="w-full h-dvh flex flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[28rem] h-full flex flex-col relative mx-auto overflow-hidden min-w-0 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {children}
    </div>
  );
}
