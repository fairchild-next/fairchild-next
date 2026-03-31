/**
 * Fairchild wedding mode – copy, links, and asset paths.
 * For other venues, add e.g. `clients/otherGarden/weddingContent.ts` and swap the import in UI.
 */

export const weddingSiteUrl = "https://fairchildgarden.org/garden-wedding-miami/";
/** Current booklet linked from fairchildgarden.org/garden-wedding-miami/ (2026) */
export const weddingBookletPdfUrl =
  "https://fairchildgarden.org/wp-content/uploads/2026/02/Fairchild-Wedding-Booklet-2026.pdf";
export const weddingContactEmail = "weddings@fairchildgarden.org";

export const gardenAddress = {
  line1: "Fairchild Tropical Botanic Garden",
  line2: "10901 Old Cutler Road",
  city: "Coral Gables, FL 33156",
};

/** Paths under /public/wedding */
export const weddingImages = {
  heroHome: "/wedding/hero-home.png",
  packagesOverview: "/wedding/packages-overview.png",
  packageCeremony: "/wedding/package-ceremony.png",
  packageGardenHouse: "/wedding/package-garden-house.png",
  packageArtCenter: "/wedding/package-art-center.png",
  packageMarquee: "/wedding/package-marquee.png",
  venuesOverview: "/wedding/venues-overview.png",
  receptionLocations: "/wedding/reception-locations.png",
  ourServices: "/wedding/our-services.png",
  vendorInformation: "/wedding/vendor-information.png",
  additionalInformation: "/wedding/additional-information.png",
  mapView: "/wedding/map-view.png",
  mapViewAlt: "/wedding/map-view-alt.png",
  aboutFairchild: "/wedding/about-fairchild.png",
  venueAlleeOverlook: "/wedding/venue-allee-overlook.png",
  venueArboretum: "/wedding/venue-arboretum.png",
  venueArtCenter: "/wedding/venue-art-center.png",
  gallery: [
    "/wedding/gallery-1.png",
    "/wedding/gallery-2.png",
    "/wedding/gallery-3.png",
    "/wedding/gallery-4.png",
    "/wedding/gallery-5.png",
    "/wedding/gallery-6.png",
    "/wedding/gallery-7.png",
    "/wedding/gallery-8.png",
    "/wedding/gallery-9.png",
    "/wedding/gallery-10.png",
  ],
  /** Home screen 2×2 tiles (match UX mockup imagery) */
  homeTiles: {
    venues: "/wedding/venues-overview.png",
    packages: "/wedding/reception-locations.png",
    map: "/wedding/map-view.png",
    gallery: "/wedding/gallery-5.png",
  },
  /** Details tab (/learn) hero — replace file in public/wedding to match your mock */
  detailsHero: "/wedding/details-hero.png",
} as const;

/** Details tab list rows (thumbnails + routes) */
export const weddingDetailsLinks: {
  href: string;
  label: string;
  thumb: string;
}[] = [
  {
    href: "/wedding/about",
    label: "About Fairchild",
    thumb: "/wedding/hero-home.png",
  },
  {
    href: "/wedding/packages",
    label: "Wedding Packages",
    thumb: "/wedding/details-thumb-packages.png",
  },
  {
    href: "/wedding/venues",
    label: "Wedding Venues",
    thumb: "/wedding/details-thumb-venues.png",
  },
  {
    href: "/wedding/vendors",
    label: "Vendor Information",
    thumb: "/wedding/details-thumb-vendors.png",
  },
  {
    href: "/wedding/services",
    label: "Our Services",
    thumb: "/wedding/details-thumb-services.png",
  },
  {
    href: "/wedding/information",
    label: "Additional Information",
    thumb: "/wedding/details-thumb-additional.png",
  },
];

export const weddingDetailsIntro =
  "Imagine yourself saying “I Do” surrounded by lush gardens and romantic vistas. That’s what you can expect when you have your event at Fairchild.";

export type WeddingPackageSlug =
  | "ceremony"
  | "garden-house"
  | "art-center"
  | "marquee";

export const weddingPackages: {
  slug: WeddingPackageSlug;
  title: string;
  image: string;
  /** Lead line under the hero (unchanged UX) */
  summary: string;
  /** Short extra paragraphs—must-knows from fairchildgarden.org + wedding booklet */
  moreInfo: string[];
}[] = [
  {
    slug: "ceremony",
    title: "Ceremony Package",
    image: weddingImages.packageCeremony,
    summary:
      "Ceremony only at your choice of outdoor locations. Base rates from 1–25 guests; additional guests priced per person. Ceremonies scheduled for 2 hours during Garden hours.",
    moreInfo: [
      "Pick from Fairchild’s outdoor ceremony sites—such as Bailey Palm Glade, the Garden Club of America Amphitheatre, Cycad Vista Lawn, Allée and Overlook Vista, the Tropical Arboretum, or Phillips Gate Courtyard (subject to availability and garden rules).",
      "Your base rental includes white resin or mahogany padded ceremony chairs. Published rates start at $2,500++ for 1–25 guests, plus $30 per additional guest. All ceremony rentals are subject to 7% Florida sales tax; confirm current pricing and your date with the wedding team.",
      "Ceremonies run for two hours during regular Garden hours (typically 10:00 am–5:00 pm). Fairchild requires a professional day-of wedding coordinator. Exclusive use of the Garden is not included—other weddings or events may occur the same day.",
      "A 50% deposit reserves your date (see the wedding booklet for refund timing and balance due dates). Restrictions can apply to location and timing; your coordinator will walk you through the details.",
    ],
  },
  {
    slug: "garden-house",
    title: "The Garden House Package",
    image: weddingImages.packageGardenHouse,
    summary:
      "Garden House & Grande Lawn for ceremony, cocktail hour, and reception (6 hr). Capacity 250–400 seated or cocktail style.",
    moreInfo: [
      "This package bundles your outdoor ceremony, cocktail hour, and a six-hour reception using the Garden House and/or Grande Lawn—ideal for about 250 seated guests or up to 400 cocktail-style.",
      "Pricing is built from a 1–100 guest base, plus $30 per additional guest. Evening rates differ by night (Friday/Sunday, Saturday, and Monday–Thursday have different starting tiers on fairchildgarden.org). Taxes and contract details apply.",
      "Includes catering kitchen access (with garden restrictions), restrooms, a complimentary one-hour guided photo session for the couple, and shuttle service within the Garden for guests who need extra assistance.",
      "A professional month-of wedding coordinator is required. A $3,000 deposit holds your date; see the booklet for payment schedule and policies.",
    ],
  },
  {
    slug: "art-center",
    title: "The Art Center Package",
    image: weddingImages.packageArtCenter,
    summary:
      "Rose & McQuillan Art Center & Veranda for ceremony, cocktail hour, and reception (6 hr). Capacity 200–300.",
    moreInfo: [
      "Host your ceremony, cocktail hour, and a six-hour reception in the Rose & McQuillan Art Center and Veranda—about 200–300 guests depending on layout.",
      "Rates are structured from a 1–150 guest base, plus $30 per additional guest, with separate starting tiers for Friday/Sunday, Saturday, and Monday–Thursday evenings (published on the wedding page). 7% sales tax and contract terms apply.",
      "You’ll have catering kitchen access (with restrictions), restrooms, the same complimentary one-hour couple photo session, and in-garden shuttle service for guests who need help getting around.",
      "A month-of wedding coordinator is required. A $4,000 deposit reserves your date; balance and cancellation terms are outlined in the wedding booklet.",
    ],
  },
  {
    slug: "marquee",
    title: "The Marquee Package",
    image: weddingImages.packageMarquee,
    summary:
      "Lakeside Marquee Tent & Pandanus Lawn for cocktail hour and reception (6 hr). Capacity 300–500.",
    moreInfo: [
      "Fairchild’s largest reception experience: a six-hour cocktail hour and reception at the Lakeside Marquee Tent and Pandanus Lawn, with capacity in the roughly 300–500 guest range depending on your floor plan.",
      "Pricing starts from a 1–250 guest base, plus $30 per additional guest, with evening rates listed by day of week on fairchildgarden.org (Friday/Sunday, Saturday, Monday–Thursday). Taxes and final contract pricing apply.",
      "Includes catering tent access (with restrictions), restrooms, a one-hour guided photo session for the couple, and shuttle service in the Garden. Optional rain backup for ceremony and cocktail hour is available for an additional fee—ask the events team.",
      "A month-of wedding coordinator is required. A $4,000 deposit holds your date; see the booklet for the full fee schedule and policies.",
    ],
  },
];

/** Copy aligned with fairchildgarden.org/garden-wedding-miami/ (outdoor venues section). */
export const weddingVenuesIntro =
  "Outdoor wedding venues in Miami for daytime and evening ceremonies. Explore our featured spaces below—restrictions may apply; your Fairchild wedding coordinator can help you choose the perfect setting.";

export type WeddingVenueSlug =
  | "bailey-palm-glade"
  | "garden-club-amphitheatre"
  | "rose-mcquillan-art-center"
  | "tropical-arboretum"
  | "allee-overlook"
  | "amazonica-pool-lawn"
  | "cycad-vista-lawn"
  | "the-palmetum"
  | "ellipse-mosaic-patio"
  | "garden-house-lawn"
  | "phillips-courtyard"
  | "glasshouse-cafe-patio"
  | "lakeside-marquee-tent";

export type WeddingVenue = {
  slug: WeddingVenueSlug;
  title: string;
  /** Hero / list thumbnail */
  image: string;
  /** One-line list subtitle, e.g. guests + uses */
  synopsis: string;
  /** Detail page: capacity line */
  capacity: string;
  /** Detail page: uses line */
  uses: string;
  /** Long description from Fairchild’s wedding page */
  description: string;
};

export const weddingVenues: WeddingVenue[] = [
  {
    slug: "bailey-palm-glade",
    title: "Bailey Palm Glade",
    image: "/wedding/gallery-1.png",
    synopsis: "375 guests · Ceremony, cocktail hour",
    capacity: "375 guests",
    uses: "Ceremony, cocktail hour",
    description:
      "The Bailey Palm Glade is our most sought-after Miami garden wedding venue, celebrated for its spectacular vistas. This stunning location features sweeping views of the garden’s lush landscapes and tranquil waters, providing a breathtaking backdrop for your vows. With its elegant palm-lined setting and panoramic scenery, Bailey Palm offers an unparalleled and picturesque environment that captures the essence of a tropical paradise. Ideal for couples seeking a breathtaking and unforgettable ceremony, Bailey Palm combines natural beauty with a sense of grandeur, making it a top choice for a memorable wedding celebration.",
  },
  {
    slug: "garden-club-amphitheatre",
    title: "Garden Club of America Amphitheatre",
    image: "/wedding/gallery-2.png",
    synopsis: "250 guests · Ceremony only",
    capacity: "250 guests",
    uses: "Ceremony only",
    description:
      "The Garden Club of America Amphitheatre is an enchanting wedding venue for your ceremony. Nestled in the heart of lush tropical gardens, this location is unlike any other garden wedding venue in Miami, offering a breathtaking backdrop of natural beauty. The amphitheatre’s graceful design and expansive views create a serene and elegant atmosphere, perfect for exchanging vows in a picturesque open-air environment. With its seamless blend of natural splendor and refined architecture, the Garden Club of America Amphitheatre provides a truly magical and memorable setting for your special day.",
  },
  {
    slug: "rose-mcquillan-art-center",
    title: "Rose and McQuillan Art Center",
    image: weddingImages.venueArtCenter,
    synopsis: "200–300 guests · Ceremony, cocktail hour, reception",
    capacity: "200 – 300 guests",
    uses: "Ceremony, cocktail hour, reception",
    description:
      "The Rose and McQuillan Art Center at Fairchild Tropical Botanic Garden is an exceptional choice for couples seeking a distinctive and elegant wedding venue. Spanning 3,000 square feet, this sophisticated space effortlessly integrates design with the beauty of nature, offering a refined atmosphere for your celebration. With its contemporary design, high ceilings, and large windows that frame the lush garden views, the Art Center provides a stunning backdrop for both intimate cocktail hours and grand receptions. Its versatility and aesthetic charm ensure that every wedding here is both elegant and memorable, creating a perfect setting for your special day.",
  },
  {
    slug: "tropical-arboretum",
    title: "The Arboretum",
    image: weddingImages.venueArboretum,
    synopsis: "100–200 guests · Ceremony, cocktail hour",
    capacity: "100 – 200 guests",
    uses: "Ceremony, cocktail hour",
    description:
      "For ceremonies and cocktail receptions in South Florida, the Arboretum provides a picturesque backdrop with its grand, shaded tree canopies for both an intimate and open atmosphere. The dappled sunlight filtering through the foliage adds a touch of magic to your vows, making it an ideal wedding venue in Miami for a romantic and elegant exchange of promises amidst a rare and diverse collection of trees.",
  },
  {
    slug: "allee-overlook",
    title: "Allée Overlook",
    image: weddingImages.venueAlleeOverlook,
    synopsis: "80 guests · Ceremony, cocktail hour",
    capacity: "80 guests",
    uses: "Ceremony, cocktail hour",
    description:
      "Perched gracefully, the Allée Overlook offers sweeping views of the garden’s expanses and the dramatic vistas of tree-lined avenues. This elevated vantage point creates a sense of openness and grandeur, perfect for hosting intimate weddings. This Miami wedding venue’s spacious and open design allows for versatile arrangements, making it ideal for ceremonies or cocktail hours.",
  },
  {
    slug: "amazonica-pool-lawn",
    title: "Amazonica Pool Lawn",
    image: "/wedding/gallery-3.png",
    synopsis: "270 guests · Ceremony, cocktail hour",
    capacity: "270 guests",
    uses: "Ceremony, cocktail hour",
    description:
      "The Sibley Victoria Amazonica Pool is a breathtaking highlight of Fairchild Tropical Botanic Garden, featuring the world’s largest water lilies right here in Miami. The pool’s tranquil waters are adorned with these magnificent lilies, whose expansive leaves and delicate blooms provide a spectacular and serene atmosphere. Surrounded by lush, verdant foliage and vibrant tropical plants, this wedding venue is an oasis of natural beauty and elegance. The pool’s expansive and open-air environment can accommodate both intimate gatherings and larger celebrations. The space is versatile, allowing for creative arrangements and decor that complement its exotic charm.",
  },
  {
    slug: "cycad-vista-lawn",
    title: "Cycad Vista Lawn",
    image: "/wedding/gallery-4.png",
    synopsis: "275 guests · Ceremony, cocktail hour",
    capacity: "275 guests",
    uses: "Ceremony, cocktail hour",
    description:
      "The Cycad Vista Lawn is an ideal intimate wedding venue and is particularly well-suited for cocktail hours following wedding ceremonies at Bailey Palm. This charming lawn offers a serene setting surrounded by unique cycads and lush Miami greenery, providing a relaxed and inviting atmosphere for your guests. Cycad Vista Lawn seamlessly complements the grandeur of Bailey Palm.",
  },
  {
    slug: "the-palmetum",
    title: "The Palmetum",
    image: "/wedding/gallery-5.png",
    synopsis: "150–200 guests · Ceremony, cocktail hour",
    capacity: "150 – 200 guests",
    uses: "Ceremony, cocktail hour",
    description:
      "The Palmetum Lawn is a distinguished event venue, featuring a grand expanse of lush lawn framed by a majestic stone arch and surrounded by verdant trees. This elegant setting offers a spacious and refined atmosphere for a range of events, including a garden wedding in Miami. The stone arch adds a touch of timeless charm, while the verdant surroundings create a serene and inviting environment. Ideal for those seeking a blend of grandeur and natural beauty, the Palmetum Lawn provides a stunning backdrop for a memorable event.",
  },
  {
    slug: "ellipse-mosaic-patio",
    title: "Ellipse Mosaic Patio",
    image: "/wedding/gallery-6.png",
    synopsis: "50–300 guests · Ceremony, cocktail hour",
    capacity: "50 – 300 guests",
    uses: "Ceremony, cocktail hour",
    description:
      "The Mosaic Patio’s distinctive tiled surfaces, adorned with intricate patterns and vibrant hues, create a visually stunning backdrop for your wedding in Miami. Surrounded by lush greenery and a dramatic staircase (perfect for photos), the patio offers a unique and inviting atmosphere for both wedding ceremonies and cocktails. The artistic mosaic not only enhances the visual appeal but also reflects the creativity and beauty of the garden environment—a perfect cocktail hour transition for a Marquee Tent reception.",
  },
  {
    slug: "garden-house-lawn",
    title: "Garden House & Lawn",
    image: weddingImages.packageGardenHouse,
    synopsis: "250–400 guests · Ceremony, reception, cocktail hour",
    capacity: "250 – 400 guests",
    uses: "Ceremony, reception, cocktail hour",
    description:
      "Originally constructed in 1949, the Garden House was designed to envelop the Garden and flow beautifully to the outdoors with four sets of French doors and windows that open into a view of the dramatic lawn. The columnless, clear-span building allows for an unobstructed view within a 5,600 sq. ft. area, complete with terrazzo flooring and elevated wooden stage. The nearby fountain court contains a picturesque lily pond and original Chihuly art. The Garden House can accommodate 250 seated guests or 400 cocktail style. You will also find a connected catering kitchen, restrooms, and adjacent logia.",
  },
  {
    slug: "phillips-courtyard",
    title: "Phillips Courtyard",
    image: "/wedding/gallery-7.png",
    synopsis: "80–100 guests · Ceremony, reception, cocktail hour",
    capacity: "80 – 100 guests",
    uses: "Ceremony, reception, cocktail hour",
    description:
      "Phillips Courtyard, with its captivating charm, offers a tree-covered outdoor venue for your wedding welcome, cocktail hour, or ceremony. The courtyard is adorned with lush tropical greenery, limestone, and intricate wrought iron fence creating a sophisticated and historical atmosphere. A highlight of the space is the Gatehouse, an enchanting architectural feature that adds a touch of historic Florida elegance.",
  },
  {
    slug: "glasshouse-cafe-patio",
    title: "Glasshouse Café & Patio",
    image: "/wedding/gallery-8.png",
    synopsis: "50 guests · Reception, cocktail hour",
    capacity: "50 guests",
    uses: "Reception, cocktail hour",
    description:
      "The Glasshouse Café boasts stunning glass walls that immerse you in the surrounding tropical splendor, allowing natural light to flood the space and offering unobstructed views of Wings of the Tropics. A highlight of the venue is the captivating Chihuly glass display, which adds a touch of artistic grandeur and visual intrigue. The intimate yet spacious layout is perfect for small, intimate receptions, accommodating up to 50 guests. The wedding reception venue’s outdoor terrace provides an ideal space for cocktail hours or an alfresco dining experience, where your guests can enjoy the gentle breeze and the tranquil landscape. Use of our in-house catering, Le Basque, is required at this venue space.",
  },
  {
    slug: "lakeside-marquee-tent",
    title: "Lakeside Marquee Tent",
    image: weddingImages.packageMarquee,
    synopsis: "300–500 guests · Reception, cocktail hour",
    capacity: "300 – 500 guests",
    uses: "Reception, cocktail hour",
    description:
      "The Lakeside Marquee Tent at Fairchild Tropical Botanic Garden is our most popular event venue for wedding receptions, offering a stunning and versatile setting for your celebration. With its expansive design, the tent can comfortably accommodate 350 to 500 guests, providing ample space for grand affairs. Situated by the tranquil lake, this venue offers breathtaking views and a serene atmosphere. The Marquee can be transformed into anything you dream of, from elegant and classic to modern and chic, ensuring the vision for your garden wedding in Miami comes to life in this enchanting space.",
  },
];

export function getWeddingVenueBySlug(slug: string) {
  return weddingVenues.find((v) => v.slug === slug);
}

export const weddingServicesHighlights = [
  "Professional event staff support throughout your event",
  "Rain backup options and à la carte enhancements",
  "Complimentary guest parking and day-of Garden access",
  "Complimentary 1-hour guided photo session for bride & groom",
] as const;
