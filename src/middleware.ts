import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Refreshes Supabase auth cookies on each request so Route Handlers (e.g. /api/map/*)
 * see the same session as the browser. Without this, save/copy can hit the API as
 * effectively logged-out even when the client shows you as signed in.
 */
export async function middleware(request: NextRequest) {
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
