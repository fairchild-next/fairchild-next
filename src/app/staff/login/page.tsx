import { Suspense } from "react";
import StaffLoginForm from "./StaffLoginForm";

export default function StaffLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="text-[var(--text-muted)]">Loading…</span>
      </div>
    }>
      <StaffLoginForm />
    </Suspense>
  );
}
