/**
 * Site/tenant feature flags. Per-client customization for multi-tenant deployments.
 * Fairchild: no activation step — tickets are valid immediately after purchase.
 * Other clients (e.g. NYC MTA-style): require users to "activate" before use.
 */
export const siteConfig = {
  /** When true, show "ACTIVATED" status bar on current tickets and gate scan/use on activation. */
  ticketRequiresActivation:
    process.env.NEXT_PUBLIC_TICKET_REQUIRE_ACTIVATION === "true",

  /**
   * Max tickets per member reservation (member + guests). Fairchild: 4 (self + 3 guests).
   * Set to null for no limit. Other sites: use env NEXT_PUBLIC_MEMBER_TICKET_MAX=0 for no limit.
   */
  memberTicketMaxPerReservation: (() => {
    const r = process.env.NEXT_PUBLIC_MEMBER_TICKET_MAX;
    if (r === undefined || r === "") return 4;
    const n = parseInt(r, 10);
    return n <= 0 ? null : n;
  })(),
} as const;
