import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Limitation: each Vercel serverless instance has its own Map, so limits are
 * per-instance, not global. This still blocks bursts from a single client
 * hitting the same cold instance. For global enforcement upgrade to
 * Upstash Redis (@upstash/ratelimit) and swap out the store below.
 */

type WindowEntry = { count: number; windowStart: number };
const store = new Map<string, WindowEntry>();

const RATE_RULES: { pattern: RegExp; limit: number; windowMs: number }[] = [
  // Checkout & reservations — tightest limit
  { pattern: /^\/api\/checkout$/,          limit: 6,  windowMs: 60_000 },
  { pattern: /^\/api\/members\/reserve$/,  limit: 6,  windowMs: 60_000 },
  // Discovery photo uploads
  { pattern: /^\/api\/discoveries$/,       limit: 20, windowMs: 60_000 },
  // Ticket scanning (staff tool — higher limit)
  { pattern: /^\/api\/scan-ticket$/,       limit: 30, windowMs: 60_000 },
  // Badge check endpoint
  { pattern: /^\/api\/badges\/check$/,     limit: 20, windowMs: 60_000 },
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);

  if (isRateLimited(ip, pathname)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/checkout",
    "/api/members/reserve",
    "/api/discoveries",
    "/api/scan-ticket",
    "/api/badges/check",
  ],
};
