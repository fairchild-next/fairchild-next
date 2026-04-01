/**
 * Path prefixes that require a Supabase session. Used by SupabaseBrowserProvider
 * to redirect unauthenticated users to /login.
 */
export function pathRequiresAuth(pathname: string): boolean {
  const prefixes = [
    "/wallet",
    "/member/profile",
    "/tickets/my",
    "/account",
    "/account/stats",
    "/tickets/checkout",
    "/tickets/member",
    "/membership",
  ];
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
