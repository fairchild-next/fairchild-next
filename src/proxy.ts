import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Runs on the Edge before routes. Refreshes Supabase auth cookies so Route Handlers
 * (e.g. /api/map/*) see the same session as the browser.
 *
 * Next.js 16+: use `proxy.ts` + `export function proxy` (middleware file is deprecated).
 *
 * Rate limiting is applied here before session refresh.
 * NOTE: Edge Runtime state is per-instance on Vercel (not global).
 * Upgrade path: swap store for Upstash Redis (@upstash/ratelimit) for global limits.
 */

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
type WindowEntry = { count: number; windowStart: number };
const store = new Map<string, WindowEntry>();

const RATE_RULES: { pattern: RegExp; limit: number; windowMs: number }[] = [
  { pattern: /^\/api\/checkout$/,         limit: 6,  windowMs: 60_000 },
  { pattern: /^\/api\/members\/reserve$/, limit: 6,  windowMs: 60_000 },
  { pattern: /^\/api\/discoveries$/,      limit: 20, windowMs: 60_000 },
  { pattern: /^\/api\/scan-ticket$/,      limit: 30, windowMs: 60_000 },
  { pattern: /^\/api\/badges\/check$/,    limit: 20, windowMs: 60_000 },
];

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string, path: string): boolean {
  const rule = RATE_RULES.find((r) => r.pattern.test(path));
  if (!rule) return false;

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > rule.windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > rule.limit) return true;
  store.set(key, entry);
  return false;
}

// ---------------------------------------------------------------------------
// Proxy (Next.js 16 equivalent of middleware)
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIP(request);

  if (isRateLimited(ip, pathname)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     * See https://supabase.com/docs/guides/auth/server-side/nextjs
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
