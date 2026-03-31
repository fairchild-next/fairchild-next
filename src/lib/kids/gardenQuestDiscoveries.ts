/**
 * Discoveries from Garden Quest - photo or description the kid chose when they found something.
 * Used by "My Discoveries" under the Badges tab. Separate from the "Found" tab in Garden Quest.
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

const STORAGE_KEY = "fairchild-kids-garden-quest-discoveries";
export const FOUND_IDS_KEY = "fairchild-kids-garden-quest-found";

export function getDiscoveries(): DiscoveryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addDiscovery(entry: Omit<DiscoveryEntry, "createdAt">) {
  const discoveries = getDiscoveries();
  const newEntry: DiscoveryEntry = {
    ...entry,
    createdAt: new Date().toISOString(),
  };
  // Replace if same quest (e.g. they re-did it)
  const filtered = discoveries.filter((d) => d.questId !== entry.questId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, newEntry]));
  } catch {
    // ignore
  }
}

export function clearDiscoveries() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function clearFoundIds() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FOUND_IDS_KEY);
  } catch {
    // ignore
  }
}
