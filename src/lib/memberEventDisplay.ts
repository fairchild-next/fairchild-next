/**
 * Member-specific event display. In the members app only, certain events
 * are shown with differentiated names (e.g. "MEMBERS ONLY").
 */

const MEMBERS_ONLY_EVENT = {
  slug: "sunrise-tea-ceremony",
  memberName: "MEMBERS ONLY Sunrise Tea Ceremony",
  memberDate: "Jun 16, 2026",
} as const;

/** Slugs of events that are members-only (exclusive to members). */
export const MEMBERS_ONLY_EVENT_SLUGS: string[] = [MEMBERS_ONLY_EVENT.slug];

export function isMembersOnlyEvent(slug: string): boolean {
  return MEMBERS_ONLY_EVENT_SLUGS.includes(slug);
}

export function getMemberEventDisplay(
  slug: string,
  originalName: string,
  startDate: string,
  endDate: string,
  isMember: boolean
): { name: string; dateStr: string } {
  if (!isMember || slug !== MEMBERS_ONLY_EVENT.slug) {
    const s = new Date(startDate + "T00:00:00");
    const e = new Date(endDate + "T00:00:00");
    const dateStr =
      startDate === endDate
        ? s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    return { name: originalName, dateStr };
  }
  return {
    name: MEMBERS_ONLY_EVENT.memberName,
    dateStr: MEMBERS_ONLY_EVENT.memberDate,
  };
}
