import { NextResponse } from "next/server";

/**
 * Returns a generic 500 response and logs the real error server-side.
 * Never expose raw Supabase/DB error messages to the client.
 */
export function serverError(context: string, err: unknown): NextResponse {
  console.error(`[${context}]`, err);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

/**
 * Returns a generic 400 response and logs the real error server-side.
 * Use for staff-only routes where the raw error would otherwise be helpful
 * but should still not leak DB internals to the client.
 */
export function badRequestError(context: string, err: unknown): NextResponse {
  console.error(`[${context}]`, err);
  return NextResponse.json(
    { error: "Bad request" },
    { status: 400 }
  );
}
