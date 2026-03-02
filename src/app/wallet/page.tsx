"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tickets/my");
  }, [router]);

  return (
    <div className="p-6 flex items-center justify-center min-h-[200px]">
      <p className="text-gray-500">Redirecting to your tickets…</p>
    </div>
  );
}
