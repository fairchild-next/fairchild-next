"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Wallet icon in top right on all ticket pages except My Tickets (wallet) itself */
function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWalletPage = pathname === "/tickets/my" || pathname?.startsWith("/tickets/my/");

  return (
    <div className="relative min-h-full">
      {!isWalletPage && (
        <Link
          href="/tickets/my"
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-primary)] hover:border-[var(--primary)] transition"
          aria-label="View your tickets"
        >
          <WalletIcon />
        </Link>
      )}
      {children}
    </div>
  );
}
