export type PlantSuperpower = {
  id: string;
  title: string;
  image: string;
};

export type PlantSuperpowerDetail = {
  id: string;
  question: string;
  description: string;
  examples: {
    name: string;
    image: string;
    description: string;
  }[];
};

export const PLANT_SUPERPOWERS: PlantSuperpower[] = [
  {
    id: "eat-bugs",
    title: "Plants that eat bugs.",
    image: "/kids/plant-superpower-eat-bugs.png",
  },
  {
    id: "float",
    title: "Plants that float.",
    image: "/kids/plant-superpower-float.png",
  },
  {
    id: "flowers-smell",
    title: "Flowers that smell good.",
    image: "/kids/plant-superpower-flowers-smell.png",
  },
  {
    id: "plants-smell",
    title: "Plants that smell good.",
    image: "/kids/plant-superpower-plants-smell.png",
  },
];

export const PLANT_SUPERPOWER_DETAILS: Record<string, PlantSuperpowerDetail> = {
  "eat-bugs": {
    id: "eat-bugs",
    question: "Why do plants eat bugs?",
    description:
      "Some plants grow in soil that doesn't have many nutrients. To survive, they catch insects and digest them!",
    examples: [
      {
        name: "Venus Flytrap",
        image: "/kids/plant-example-venus-flytrap.png",
        description: "Snaps shut when an insect lands inside.",
      },
      {
        name: "Pitcher Plant",
        image: "/kids/plant-example-pitcher.png",
        description: "Insects fall into a slippery tube filled with liquid.",
      },
      {
        name: "Sundew",
        image: "/kids/plant-example-sundew.png",
        description: "Tiny sticky drops trap bugs inside.",
      },
    ],
  },
  "float": {
    id: "float",
    question: "Why do some plants float?",
    description:
      "Some plants have special leaves or stems that trap air, helping them float on water. This lets them get sunlight at the surface!",
    examples: [
      {
        name: "Water Lily",
        image: "/kids/plant-example-water-lily.png",
        description: "Flat leaves and air-filled stems keep it on the surface.",
      },
      {
        name: "Duckweed",
        image: "/kids/plant-example-duckweed.png",
        description: "Tiny plants that float in clusters on ponds.",
      },
      {
        name: "Water Hyacinth",
        image: "/kids/plant-example-water-hyacinth.png",
        description: "Spongy leaf stalks help it float on water.",
      },
    ],
  },
  "flowers-smell": {
    id: "flowers-smell",
    question: "Why do flowers smell good?",
    description:
      "Flowers use their sweet scent to attract pollinators like bees and butterflies. The smell helps them find the flower and spread its pollen!",
    examples: [
      {
        name: "Rose",
        image: "/kids/plant-example-rose.png",
        description: "A classic sweet fragrance that attracts bees.",
      },
      {
        name: "Jasmine",
        image: "/kids/plant-example-jasmine.png",
        description: "Strong, sweet scent that blooms at night.",
      },
      {
        name: "Lavender",
        image: "/kids/plant-example-lavender.png",
        description: "Calming scent that bees and butterflies love.",
      },
    ],
  },
  "plants-smell": {
    id: "plants-smell",
    question: "Why do some plants smell good?",
    description:
      "Plants use scents to attract pollinators, scare away hungry animals, or even communicate. Some leaves smell when you touch them!",
    examples: [
      {
        name: "Mint",
        image: "/kids/plant-example-mint.png",
        description: "Fresh scent that keeps some bugs away.",
      },
      {
        name: "Basil",
        image: "/kids/plant-example-basil.png",
        description: "Aromatic leaves that attract beneficial insects.",
      },
      {
        name: "Eucalyptus",
        image: "/kids/plant-example-eucalyptus.png",
        description: "Strong scent that many animals avoid.",
      },
    ],
  },
};
