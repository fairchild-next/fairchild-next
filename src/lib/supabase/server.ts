import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Access token from client fetch (Authorization: Bearer …). Use when cookies are missing in Route Handlers. */
export function extractBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t || null;
}

/**
 * Supabase client for Route Handlers: prefers Bearer token from the request, else cookie session.
 */
export async function createSupabaseClientForRoute(req: Request): Promise<SupabaseClient> {
  const bearer = extractBearerToken(req);
  if (bearer) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${bearer}` },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return createSupabaseServerClient();
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // ✅ MUST await in Next 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            /* Server Components cannot set cookies; route handlers refresh session when needed */
          }
        },
      },
    }
  );
}