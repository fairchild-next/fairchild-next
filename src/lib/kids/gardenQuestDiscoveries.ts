/**
 * Discoveries from Garden Quest - photo or description the kid chose when they found something.
 * Used by "My Discoveries" under the Badges tab. Separate from the "Found" tab in Garden Quest.
 *
 * All storage keys are namespaced by child profile ID when a child is active,
 * falling back to the legacy keys for parent/no-child-selected mode.
 */

export type DiscoveryEntry = {
  questId: string;
  questName: string;
  type: "photo" | "description";
  content: string; // data URL for photo, text for description
  createdAt: string; // ISO string
  /** Stock quest image - used for description entries to show photo + text */
  questImage?: string;
};

const BASE_DISCOVERIES_KEY = "fairchild-kids-garden-quest-discoveries";
const BASE_FOUND_KEY = "fairchild-kids-garden-quest-found";

/** Legacy keys used when no child profile is active (backward-compatible). */
export const FOUND_IDS_KEY = BASE_FOUND_KEY;

function discoveriesKey(childId?: string | null): string {
  return childId ? `${BASE_DISCOVERIES_KEY}-${childId}` : BASE_DISCOVERIES_KEY;
}

export function foundIdsKey(childId?: string | null): string {
  return childId ? `${BASE_FOUND_KEY}-${childId}` : BASE_FOUND_KEY;
}

export function getDiscoveries(childId?: string | null): DiscoveryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(discoveriesKey(childId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addDiscovery(entry: Omit<DiscoveryEntry, "createdAt">, childId?: string | null) {
  const discoveries = getDiscoveries(childId);
  const newEntry: DiscoveryEntry = {
    ...entry,
    createdAt: new Date().toISOString(),
  };
  // Replace if same quest (e.g. they re-did it)
  const filtered = discoveries.filter((d) => d.questId !== entry.questId);
  try {
    localStorage.setItem(discoveriesKey(childId), JSON.stringify([...filtered, newEntry]));
  } catch {
    // ignore
  }
}

export function clearDiscoveries(childId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(discoveriesKey(childId));
  } catch {
    // ignore
  }
}

export function getFoundIds(childId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(foundIdsKey(childId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearFoundIds(childId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(foundIdsKey(childId));
  } catch {
    // ignore
  }
}
