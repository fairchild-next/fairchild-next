/**
 * Badge check logic - extend by adding new conditions to BADGE_CHECKS.
 * Kept simple and easy to extend.
 */

import { GARDEN_QUESTS } from "./gardenQuestData";

export type DiscoveryRow = {
  quest_item: string;
  photo_url: string | null;
  note: string | null;
};

export type BadgeCheckResult = {
  badgeKey: string;
  earned: boolean;
};

const QUEST_TYPE_MAP: Record<string, string> = {
  "blue-butterfly": "butterfly",
  "red-flower": "flower",
  "palm-tree": "tree",
};

const QUEST_ZONE_MAP: Record<string, string> = {
  "blue-butterfly": "pavilion",
  "red-flower": "rainforest",
  "palm-tree": "garden",
};

const TOTAL_QUESTS = GARDEN_QUESTS.length;

function getQuestType(questItem: string): string {
  return QUEST_TYPE_MAP[questItem] ?? questItem;
}

function getQuestZone(questItem: string): string {
  return QUEST_ZONE_MAP[questItem] ?? "unknown";
}

export function checkForBadges(discoveries: DiscoveryRow[]): string[] {
  const earned: string[] = [];
  const questItems = discoveries.map((d) => d.quest_item);
  const uniqueTypes = new Set(questItems.map(getQuestType));
  const uniqueZones = new Set(questItems.map(getQuestZone));
  const photoCount = discoveries.filter((d) => d.photo_url).length;

  // Tier 1: First Wins
  if (questItems.some((q) => getQuestType(q) === "butterfly")) earned.push("butterfly-finder");
  if (questItems.some((q) => getQuestType(q) === "flower")) earned.push("flower-spotter");
  if (questItems.some((q) => getQuestType(q) === "tree")) earned.push("tree-explorer");

  // Tier 2: Progress
  const flowerCount = questItems.filter((q) => getQuestType(q) === "flower").length;
  if (flowerCount >= 3) earned.push("flower-collector");

  const hasButterfly = questItems.some((q) => getQuestType(q) === "butterfly");
  const hasBee = questItems.some((q) => getQuestType(q) === "bee");
  const hasFlower = questItems.some((q) => getQuestType(q) === "flower");
  if (hasButterfly && hasBee && hasFlower) earned.push("pollinator-pal");
  else if (hasButterfly && hasFlower) earned.push("pollinator-pal"); // Relaxed until bee quest added

  if (photoCount >= 3) earned.push("nature-photographer");

  // Tier 3: Exploration
  if (questItems.length >= 5) earned.push("nature-detective");
  else if (questItems.length >= 3) earned.push("nature-detective"); // Relaxed for 3 quests
  if (uniqueZones.size >= 3) earned.push("garden-traveler");

  // Tier 4: Completion
  if (questItems.length >= TOTAL_QUESTS) earned.push("garden-explorer");

  // Secret: 3 plant types + 1 photo
  if (uniqueTypes.size >= 3 && photoCount >= 1) earned.push("secret-garden");

  return earned;
}
