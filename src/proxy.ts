import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Runs on the Edge before routes. Refreshes Supabase auth cookies so Route Handlers
 * (e.g. /api/map/*) see the same session as the browser.
 *
 * Next.js 16+: use `proxy.ts` + `export function proxy` (middleware file is deprecated).
 */
export async function proxy(request: NextRequest) {
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
