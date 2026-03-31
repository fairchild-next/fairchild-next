export type GardenQuestItem = {
  id: string;
  name: string;
  image: string;
  hint: string;
  /** Color for the descriptor word (e.g. "red", "blue"). Omit for items like "palm tree". */
  nameColor?: string;
  /** For badge logic: butterfly, flower, tree, bee, etc. */
  questType?: string;
  /** For Garden Traveler badge: zone/area name */
  zone?: string;
};

/** Map quest id to type for badge logic */
export const QUEST_TYPE_MAP: Record<string, string> = {
  "blue-butterfly": "butterfly",
  "red-flower": "flower",
  "palm-tree": "tree",
};

/** Tailwind class for the descriptor word color. Use !important to override inherited styles. */
export const QUEST_NAME_COLOR_CLASSES: Record<string, string> = {
  red: "!text-red-600",
  blue: "!text-blue-600",
  orange: "!text-orange-600",
  yellow: "!text-yellow-600",
  green: "!text-green-600",
  purple: "!text-purple-600",
  black: "!text-gray-800",
};

export function getQuestNameColorClass(colorKey: string): string {
  return QUEST_NAME_COLOR_CLASSES[colorKey.toLowerCase()] ?? "!text-[#193521]";
}

export const GARDEN_QUESTS: GardenQuestItem[] = [
  {
    id: "blue-butterfly",
    name: "blue butterfly",
    image: "/kids/quest-blue-butterfly.png",
    hint: "Check out the Butterfly Pavilion or look near flowers.",
    nameColor: "blue",
    questType: "butterfly",
    zone: "pavilion",
  },
  {
    id: "red-flower",
    name: "red flower",
    image: "/kids/quest-red-flower.png",
    hint: "Look in the Rainforest Exhibit or along the main garden path.",
    nameColor: "red",
    questType: "flower",
    zone: "rainforest",
  },
  {
    id: "palm-tree",
    name: "palm tree",
    image: "/kids/quest-palm-tree.png",
    hint: "Look up! They are very tall.",
    questType: "tree",
    zone: "garden",
  },
];

export const WORD_HELPER_CATEGORIES = [
  {
    title: "Size",
    words: ["Big", "Small", "Gigantic", "Short", "Tall"],
  },
  {
    title: "Texture",
    words: ["Rough", "Bumpy", "Slimy", "Furry", "Wet"],
  },
  {
    title: "Color",
    words: ["Red", "Orange", "Yellow", "Green", "Blue", "Black", "Purple"],
  },
  {
    title: "Sound",
    words: ["Loud", "Quiet", "Faint", "Pleasant", "Screechy", "Noisy", "Melodic"],
  },
];
