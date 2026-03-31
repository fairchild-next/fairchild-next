import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function passthrough(request: NextRequest) {
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

/**
 * Supabase session refresh for Edge (proxy). Must not throw — a failure here becomes
 * MIDDLEWARE_INVOCATION_FAILED / proxy 500 on Vercel for every matched route.
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    return passthrough(request);
  }

  try {
    const response = NextResponse.next({
      request: { headers: request.headers },
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              path: "/",
              sameSite: "lax",
              ...options,
            });
          });
        },
      },
    });

    await supabase.auth.getUser();
    return response;
  } catch (err) {
    console.error("[proxy] Supabase session refresh failed:", err);
    return passthrough(request);
  }
}
