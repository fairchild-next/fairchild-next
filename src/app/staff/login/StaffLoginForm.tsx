"use client";

import { useState } from "react";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function StaffLoginForm() {
  const supabase = useSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Default to the portal dashboard, not the scanner
  const redirect = searchParams.get("redirect") || "/staff";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState<string | null>(null);
  const [isError, setIsError]   = useState(true);
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!supabase) return;
    if (!email.trim()) {
      setIsError(true);
      setMessage("Enter your email above, then tap Forgot password.");
      return;
    }
    setMessage(null);
    setResetSent(false);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/staff/login` : undefined,
      });
      if (error) throw error;
      setResetSent(true);
      setIsError(false);
      setMessage("Reset link sent! Check your email.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send reset email.";
      setIsError(true);
      setMessage(/rate limit|too many requests/i.test(msg) ? "Too many requests. Try again in an hour." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setMessage(null);
    setResetSent(false);
    setLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = authData?.user;
      if (!user) throw new Error("Session not found.");

      const { data: staffRow } = await supabase
        .from("staff")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!staffRow) {
        await supabase.auth.signOut();
        setIsError(true);
        setMessage("No staff access found for this account. Contact your admin.");
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="px-5 pt-5 max-w-sm mx-auto">

        {/* ── Back link ──────────────────────────────────────────── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 text-[var(--primary)]"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Fairchild
        </Link>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/logo-fairchild.png"
            alt="Fairchild"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Staff Portal</h1>
            <p className="text-sm text-[var(--text-muted)]">Sign in with your staff credentials.</p>
          </div>
        </div>

        {/* ── Restricted access badge ────────────────────────────── */}
        <div
          className="mb-5 rounded-xl p-3.5 flex items-start gap-2.5"
          style={{ background: "#f0f4f0", border: "1px solid #d4e0d4" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="#4a6741" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <p className="text-sm" style={{ color: "#4a6741" }}>
            Restricted access. This portal is for Fairchild staff only.
          </p>
        </div>

        {/* ── Form card ──────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@fairchildgarden.org"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors border border-[var(--surface-border)] bg-[var(--background)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading || resetSent}
                  className="text-xs font-medium text-[var(--primary)] transition-opacity disabled:opacity-50"
                >
                  {resetSent ? "Email sent ✓" : "Forgot password?"}
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors border border-[var(--surface-border)] bg-[var(--background)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50 mt-1"
              style={{ background: "var(--text-primary)" }}
            >
              {loading ? "Signing in…" : "Sign in to Staff Portal"}
            </button>
          </form>

          {message && (
            <p className={`mt-3 text-sm font-medium text-center ${isError ? "text-red-500" : "text-[var(--primary)]"}`}>
              {message}
            </p>
          )}
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
