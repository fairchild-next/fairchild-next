"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function StaffLoginForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/staff/scanner";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setMessage("Enter your email first, then click Forgot password.");
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
      setMessage("Check your email for a link to reset your password.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send reset email.";
      console.error("[Forgot password]", err);
      if (/rate limit|too many requests/i.test(msg)) {
        setMessage("Too many reset requests. Please try again in about an hour.");
      } else {
        setMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setResetSent(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session not found");

      const { data: staff } = await supabase
        .from("staff")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!staff) {
        await supabase.auth.signOut();
        setMessage("You don't have staff access. Contact your admin.");
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-black">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-2">Staff Sign In</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Sign in with your staff account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-600 bg-gray-900 p-3 rounded-lg text-white placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-600 bg-gray-900 p-3 rounded-lg text-white placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] text-black py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="mt-3 w-full text-sm text-[var(--primary)] hover:underline disabled:opacity-50 text-center"
          >
            Forgot password?
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-amber-400">{message}</p>
        )}

        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
