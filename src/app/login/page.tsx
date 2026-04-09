"use client";

import { useState, useEffect } from "react";
import { useSupabaseBrowser } from "@/lib/supabase/SupabaseBrowserProvider";
import Link from "next/link";

type Tab = "guest" | "member" | "wedding";

const TABS: { id: Tab; label: string }[] = [
  { id: "guest",   label: "Non-member" },
  { id: "member",  label: "Member" },
  { id: "wedding", label: "Wedding" },
];

export default function LoginPage() {
  const { client: supabase, initialized } = useSupabaseBrowser();

  const [tab, setTab]                       = useState<Tab>("guest");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [isSignUp, setIsSignUp]             = useState(false);
  const [loading, setLoading]               = useState(false);
  const [message, setMessage]               = useState<string | null>(null);
  const [messageType, setMessageType]       = useState<"error" | "success">("error");
  const [resetSent, setResetSent]           = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(
      ({ data }: { data: { session: { user?: { email?: string } } | null } }) => {
        setCurrentUserEmail(data.session?.user?.email ?? null);
      }
    );
  }, [supabase]);

  // Reset sign-up mode when switching tabs
  function switchTab(t: Tab) {
    setTab(t);
    setIsSignUp(false);
    setMessage(null);
    setResetSent(false);
  }

  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
    setLoading(false);
    window.location.href = "/login";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) {
      setMessage("Sign-in isn't ready yet. Refresh the page.");
      setMessageType("error");
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
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then sign in.");
        setMessageType("success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const redirect =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        if (redirect) { window.location.href = redirect; return; }

        // Auto-route based on role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();
          if (staffRow) { window.location.href = "/staff"; return; }

          const { data: weddingRow } = await supabase.from("wedding_bookings").select("id").eq("couple_user_id", user.id).single();
          if (weddingRow) { window.location.href = "/couple/dashboard"; return; }
        }
        window.location.href = "/";
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!supabase) { setMessage("Sign-in isn't ready yet."); setMessageType("error"); return; }
    if (!email.trim()) { setMessage("Enter your email above, then tap Forgot password."); setMessageType("error"); return; }
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });
      if (error) throw error;
      setResetSent(true);
      setMessage("Reset link sent! Check your email.");
      setMessageType("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send reset email.";
      setMessage(/rate limit|too many requests/i.test(msg) ? "Too many requests. Try again in an hour." : msg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading / no-supabase states ───────────────────────────────────────
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f2f5f0" }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="px-5 py-10 max-w-sm mx-auto" style={{ background: "#f2f5f0", minHeight: "100vh" }}>
        <p className="text-sm font-medium text-red-600">Sign-in is not configured. Check Vercel environment variables.</p>
        <Link href="/" className="block mt-6 text-sm" style={{ color: "#4a6741" }}>← Back to Fairchild</Link>
      </div>
    );
  }

  const isWedding   = tab === "wedding";
  const buttonLabel = loading ? "Please wait…" : isSignUp ? "Create Account" : isWedding ? "Sign in to Wedding Portal" : "Sign In";

  return (
    <div style={{ background: "#f2f5f0", minHeight: "100vh" }}>
      <div className="px-5 pt-5 max-w-sm mx-auto">

        {/* ── Back link ──────────────────────────────────────────── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
          style={{ color: "#6a8a6a" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Fairchild
        </Link>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#1a2e1a", fontFamily: "Georgia, serif" }}>
            {isWedding ? "Wedding Portal" : isSignUp ? "Create Account" : "Welcome back"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7a907a" }}>
            {isWedding
              ? "Sign in with your wedding account credentials."
              : isSignUp
              ? "Join Fairchild to manage your visits and tickets."
              : "Sign in to your Fairchild account."}
          </p>
        </div>

        {/* ── Currently signed in banner ─────────────────────────── */}
        {currentUserEmail && (
          <div className="mb-4 rounded-xl p-3 flex items-center justify-between gap-3" style={{ background: "#e8efe6", border: "1px solid #c8dcc8" }}>
            <div className="min-w-0">
              <p className="text-xs font-semibold" style={{ color: "#4a6741" }}>Signed in as</p>
              <p className="text-sm font-medium truncate" style={{ color: "#2a3d2a" }}>{currentUserEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-opacity disabled:opacity-50"
              style={{ background: "#4a6741", color: "#fff" }}
            >
              Sign out
            </button>
          </div>
        )}

        {/* ── Tab segment control ────────────────────────────────── */}
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ background: "#e2e9e0" }}
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={
                tab === id
                  ? { background: "#fff", color: "#2a3d2a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { background: "transparent", color: "#8a9e8a" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Wedding info banner (Wedding tab only) ─────────────── */}
        {isWedding && (
          <div className="mb-4 rounded-xl p-3.5" style={{ background: "#fff8f0", border: "1px solid #e8d8c0" }}>
            <div className="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="#9a7020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <p className="text-sm" style={{ color: "#7a5a20" }}>
                Use the email and password your Fairchild coordinator set up for your wedding account.
              </p>
            </div>
          </div>
        )}

        {/* ── Form card ──────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#9aab9a" }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{ border: "1.5px solid #e4ebe4", background: "#f7faf7", color: "#1a2e1a" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9aab9a" }}>
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading || resetSent}
                    className="text-xs font-medium transition-opacity disabled:opacity-50"
                    style={{ color: "#6a8a6a" }}
                  >
                    {resetSent ? "Email sent ✓" : "Forgot password?"}
                  </button>
                )}
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{ border: "1.5px solid #e4ebe4", background: "#f7faf7", color: "#1a2e1a" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isSignUp}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50 mt-1"
              style={{ background: isWedding ? "#7a5a20" : "#2d5016" }}
            >
              {buttonLabel}
            </button>
          </form>

          {/* ── Error / success message ──────────────────────────── */}
          {message && (
            <p
              className="mt-3 text-sm font-medium text-center"
              style={{ color: messageType === "success" ? "#4a6741" : "#b44" }}
            >
              {message}
            </p>
          )}
        </div>

        {/* ── Sign up toggle (not shown on Wedding tab) ─────────── */}
        {!isWedding && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
              className="text-sm"
              style={{ color: "#6a8a6a" }}
            >
              {isSignUp ? "Already have an account? " : "New to Fairchild? "}
              <span className="font-bold" style={{ color: "#2d5016" }}>
                {isSignUp ? "Sign in" : "Create account"}
              </span>
            </button>
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
