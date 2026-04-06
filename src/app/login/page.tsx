"use client";

import { useState, useEffect } from "react";
import {
  useSupabaseBrowser,
} from "@/lib/supabase/SupabaseBrowserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { client: supabase, initialized } = useSupabaseBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(
        ({
          data,
        }: {
          data: { session: { user?: { email?: string } } | null };
        }) => {
          const session = data.session;
          setCurrentUserEmail(session?.user?.email ?? null);
        }
      );
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    setMessage(null);
    try {
      await supabase.auth.signOut();
      setCurrentUserEmail(null);
      window.location.href = "/login";
    } catch {
      setMessage("Could not sign out.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) {
      setMessage(
        "Sign-in isn’t ready yet. Refresh the page, or check that this deployment has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }
    setMessage(null);
    setLoading(true);
    setResetSent(false);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const redirect =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        const target = redirect || "/";
        window.location.href = target;
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!supabase) {
      setMessage("Sign-in isn’t ready yet. Check environment configuration.");
      return;
    }
    if (!email.trim()) {
      setMessage("Enter your email first, then click Forgot password.");
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined,
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

  if (!initialized) {
    return (
      <div className="p-6 pb-28 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-6">Sign In</h1>
        <div className="p-6 rounded-lg bg-gray-900 border border-gray-700">
          <p className="text-gray-300 text-sm">Loading sign-in…</p>
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="p-6 pb-28 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-6">Sign In</h1>
        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-700/50">
          <p className="text-amber-200 text-sm font-medium mb-2">
            Sign-in is not configured
          </p>
          <p className="text-gray-400 text-sm">
            This deployment is missing <code className="text-gray-300">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            or <code className="text-gray-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel project
            settings. Add them, redeploy, then try again.
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-28 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-6">Sign In</h1>

      {currentUserEmail && (
        <div className="mb-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
          <p className="text-sm text-gray-300 mb-2">Currently signed in as:</p>
          <p className="font-medium text-white">{currentUserEmail}</p>
          <p className="text-xs text-gray-400 mt-1">
            Sign out to use a different account (e.g. member account)
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="mt-3 text-sm text-amber-400 hover:text-amber-300 underline disabled:opacity-50"
          >
            Sign out
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border border-gray-600 bg-gray-900 p-3 rounded-lg text-white placeholder-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border border-gray-600 bg-gray-900 p-3 rounded-lg text-white placeholder-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isSignUp}
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed active:opacity-90"
        >
          {loading ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      {!isSignUp && (
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading}
          className="mt-3 text-sm text-[var(--primary)] hover:underline disabled:opacity-50"
        >
          Forgot password?
        </button>
      )}

      {message && (
        <p className="mt-4 text-sm text-amber-400">{message}</p>
      )}

      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-6 text-sm text-gray-400 hover:text-green-400 underline"
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </button>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
