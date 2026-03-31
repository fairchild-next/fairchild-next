/**
 * Fairchild "Events Mode" — current featured event and routes.
 * Swap this module (or drive from CMS) to reuse Events Mode for other gardens / events.
 */

export type FairchildFeaturedEventId = "bunny-hoppening";

export const currentFeaturedEventId: FairchildFeaturedEventId = "bunny-hoppening";

const base = "/events/bunny-hoppening";

export const bunnyHoppeningEvent = {
  id: "bunny-hoppening" as const,
  name: "The Bunny Hoppening",
  shortName: "Bunny Hoppening",
  tagline: "Fairchild’s annual Easter celebration",
  /** https://fairchildgarden.org/events/the-bunny-hoppening/ */
  officialUrl: "https://fairchildgarden.org/events/the-bunny-hoppening/",
  dateLine: "Sunday, April 5, 2026",
  hoursLine: "10:00 am – 5:00 pm",
  locationLine: "Fairchild Tropical Botanic Garden, Coral Gables",
  /** Aqua from Bunny Hoppening banner — keep in sync with hero art for each event */
  accentColor: "#2eb8b3",
  images: {
    heroHome: `${base}/hero-home.png`,
    detailsHero: `${base}/details-hero.png`,
    aboutFairchild: `${base}/about-fairchild.png`,
    aboutEvent: `${base}/about-event.png`,
    pricingHero: `${base}/pricing-hero.png`,
    addOnsHero: `${base}/add-ons-hero.png`,
    scheduleHero: `${base}/schedule-hero.png`,
    scheduleFull: `${base}/schedule-full.png`,
    faqsHero: `${base}/faqs-hero.png`,
    /** Home 2×2 — match mockup roles */
    tileDetails: `${base}/details-hero.png`,
    tileAddOns: `${base}/addon-picnic-adults.png`,
    tileMap: "/wedding/map-view.png",
    tileSchedule: `${base}/schedule-hero.png`,
    addonPicnicAdults: `${base}/addon-picnic-adults.png`,
    addonPicnicKids: `${base}/addon-picnic-kids.png`,
  },
  /** Details tab (/learn) intro */
  detailsIntro:
    "Celebrate The Bunny Hoppening at Fairchild with our Eggsplore Galore egg hunt, the Cottontail Express, visits by Mr. Bunny and much more!",
} as const;

/**
 * Prominent marketing color for the active featured event (banner / key art).
 * Tinted buttons only—white “light” tiles stay neutral.
 * When you add another event, extend `currentFeaturedEventId` and branch here.
 */
export function getCurrentEventAccentColor(): string {
  switch (currentFeaturedEventId) {
    case "bunny-hoppening":
      return bunnyHoppeningEvent.accentColor;
    default:
      return bunnyHoppeningEvent.accentColor;
  }
}

/** Shared class for filled-style CTAs (add `border-2` via className). */
export const eventModeAccentCtaClassName =
  "text-center font-semibold border-2 border-solid bg-[var(--surface)] shadow-sm";

/**
 * Accent text on light surface + accent ring — readable in light/dark themes.
 * (Avoids white type on pale accent fills.)
 */
export function eventModeAccentButtonStyle(accent: string) {
  return {
    backgroundColor: "var(--surface)",
    borderColor: accent,
    color: accent,
  } as const;
}

export type EventDetailsLink = {
  href: string;
  label: string;
  thumb: string;
};

export const bunnyHoppeningDetailsLinks: EventDetailsLink[] = [
  {
    href: "/events/about-fairchild",
    label: "About Fairchild",
    thumb: bunnyHoppeningEvent.images.aboutFairchild,
  },
  {
    href: "/events/about-event",
    label: "About the Event",
    thumb: bunnyHoppeningEvent.images.aboutEvent,
  },
  {
    href: "/events/pricing",
    label: "Pricing Options",
    thumb: bunnyHoppeningEvent.images.pricingHero,
  },
  {
    href: "/events/add-ons",
    label: "Premium Add-Ons",
    thumb: bunnyHoppeningEvent.images.addOnsHero,
  },
  {
    href: "/events/schedule",
    label: "Event Schedule",
    thumb: bunnyHoppeningEvent.images.scheduleHero,
  },
  {
    href: "/events/faqs",
    label: "FAQs",
    thumb: bunnyHoppeningEvent.images.faqsHero,
  },
];

/** Long-form copy sourced from Fairchild’s event page (April 2026). */
export const bunnyHoppeningAboutFairchildParagraphs = [
  "Set across 83 acres along historic Old Cutler Road, Fairchild is home to one of the world’s most significant tropical plant collections—including internationally recognized palm and cycad collections, a premier mango collection, an exceptional orchid collection, and rare aroids and other specimens found in few institutions worldwide.",
  "This is also where restoration is actively underway. The Million Orchid Project is returning native orchids to South Florida’s canopy. The Million Butterfly Project is rebuilding habitat across Miami to reintroduce butterflies into the ecology. Fairchild’s Native Plant Program strengthens regional biodiversity—all part of a broader vision for a City in a Garden.",
];

export const bunnyHoppeningAboutEventParagraphs = [
  "Due to the popularity of Bunny Hoppening, tickets are only available online. Plan early!",
  "Join us for Bunny Hoppening, Fairchild’s beloved Easter celebration designed for families who want something truly special.",
  "At the heart of the day is Eggsplore Galore—four timed egg hunt experiences on the expansive Garden House Lawn that keep the fun organized, exciting, and just the right pace for little ones.",
  "Children will meet Mr. Bunny, roam the Children’s Garden, and step inside the Wings of the Tropics exhibit, where butterflies fill the air.",
  "So grab your baskets and hop over to Fairchild on Easter!",
];

export const bunnyHoppeningPricingParagraphs = [
  "We offer two ticket options—please read and select carefully.",
  "All Access (children ages 0–12 only): includes admission to the full Bunny Hoppening and the Eggsplore Galore egg hunt. Member child $17.95 · Non-member child $28.95.",
  "General Admission (all ages): includes admission to Bunny Hoppening only; Eggsplore Galore is not included. Adults $24.95 · Senior $17.95 · Child 0–12 $11.95. Fairchild member adults are free with advance online reservation (members must log in). Member children still need All Access for the egg hunt at the member child rate.",
  "Children must always be accompanied by an adult. Adults must purchase General Admission tickets to accompany children.",
];

export const bunnyHoppeningTicketIncludes = [
  {
    title: "Eggsplore Galore",
    body: "Timed egg hunt experiences on the Garden House Lawn—organized and exciting for little ones.",
    note: "Available with All Access ticket",
  },
  {
    title: "Meet Mr. Bunny",
    body: "Seasonal photo moments and shared memories with Mr. Bunny.",
    note: "Free with General Bunny Hoppening ticket",
  },
  {
    title: "Cottontail Express",
    body: "Trackless train rides across the tropical garden.",
    note: "Free with General Bunny Hoppening ticket",
  },
  {
    title: "Bubble Bunny Hop",
    body: "Dance and play in a bubble-filled wonderland.",
    note: "Free with General Bunny Hoppening ticket",
  },
] as const;

export type PremiumAddOn = {
  id: string;
  title: string;
  price: string;
  description: string;
  image: string;
  sellingFast?: boolean;
  /** Purchase on Fairchild’s site */
  purchaseUrl: string;
};

export const bunnyHoppeningPremiumAddOns: PremiumAddOn[] = [
  {
    id: "spring-picnic-adults",
    title: "Spring Picnic Basket for Two Adults",
    price: "$65",
    description:
      "Savory brunch favorites, fresh seasonal flavors, sweet treats, and refreshing drinks—see menu options on the event page.",
    image: bunnyHoppeningEvent.images.addonPicnicAdults,
    purchaseUrl: `${bunnyHoppeningEvent.officialUrl}#premium-add-ons`,
  },
  {
    id: "mimosas-cocktails",
    title: "Mimosas & Cocktail Flights",
    price: "$34",
    description:
      "Celebrate Easter morning with refreshing mimosas and festive cocktail flights. 21+ only; valid ID required. Last call 4:30 p.m.",
    image: bunnyHoppeningEvent.images.tileAddOns,
    purchaseUrl: `${bunnyHoppeningEvent.officialUrl}#premium-add-ons`,
  },
  {
    id: "kids-picnic",
    title: "Kid’s Picnic Basket for One Child",
    price: "$25",
    description:
      "Brioche ham & cheese sandwich, fresh fruit, chips, a mini cupcake, and a drink—perfect fuel for egg hunts and garden adventures.",
    image: bunnyHoppeningEvent.images.addonPicnicKids,
    sellingFast: true,
    purchaseUrl: `${bunnyHoppeningEvent.officialUrl}#premium-add-ons`,
  },
];

export type ScheduleAgeGroup = {
  label: string;
  times: string[];
};

/** Eggsplore Galore — timed hunts (from Fairchild event page) */
export const bunnyHoppeningEggHuntSchedule: ScheduleAgeGroup[] = [
  { label: "Ages 0–3", times: ["10:30 a.m.", "12:00 p.m.", "1:30 p.m."] },
  {
    label: "Ages 4–6",
    times: [
      "10:30 a.m.",
      "11:15 a.m.",
      "12:00 p.m.",
      "12:45 p.m.",
      "1:30 p.m.",
      "2:15 p.m.",
    ],
  },
  {
    label: "Ages 7–9",
    times: ["10:30 a.m.", "12:00 p.m.", "12:45 p.m.", "1:30 p.m.", "2:15 p.m."],
  },
  {
    label: "Ages 10–12",
    times: ["10:30 a.m.", "11:15 a.m.", "12:00 p.m.", "1:30 p.m."],
  },
];

export const bunnyHoppeningFaqs: { q: string; a: string }[] = [
  {
    q: "Are tickets available at the door?",
    a: "No. Due to high demand, Bunny Hoppening and Eggsplore Galore tickets are online only. This event sells out quickly.",
  },
  {
    q: "Do adults need tickets?",
    a: "Yes. All adults must reserve or purchase General Admission. Members must log in online to reserve complimentary member admission in advance.",
  },
  {
    q: "How do member discounts work?",
    a: "Members must log in for free general admission and member pricing. Adult tickets are still required where applicable; children’s All Access is discounted for members.",
  },
  {
    q: "What about food and beverages?",
    a: "Spring food and beverage options are available. Alcohol (mini flights) is for guests 21+ with valid ID. Last call is 4:30 p.m.",
  },
  {
    q: "Rain or shine?",
    a: "Bunny Hoppening is rain or shine—dress for outdoor garden exploration.",
  },
  {
    q: "What is the refund policy?",
    a: "Tickets for Bunny Hoppening, Eggsplore Galore, flights, and picnic baskets are non-refundable.",
  },
];
