/**
 * Fairchild preferred vendor directory for the wedding couple portal.
 * Static data — replace with DB-backed management when the vendor list grows.
 */

export type Vendor = {
  name: string;
  description: string;
  website?: string;
  phone?: string;
  email?: string;
  note?: string;
};

export type VendorCategory = {
  id: string;
  label: string;
  emoji: string;
  vendors: Vendor[];
};

export const vendorCategories: VendorCategory[] = [
  {
    id: "catering",
    label: "Catering",
    emoji: "🍽️",
    vendors: [
      {
        name: "Fairchild In-House Catering",
        description: "Exclusive on-site catering partner for all Fairchild weddings. Custom menus featuring locally sourced ingredients.",
        phone: "(305) 667-1651",
        email: "weddings@fairchildgarden.org",
        note: "Required for all events held on Fairchild grounds.",
      },
    ],
  },
  {
    id: "florals",
    label: "Florals & Décor",
    emoji: "💐",
    vendors: [
      {
        name: "Tropical Florals Miami",
        description: "Specializing in lush tropical arrangements that complement Fairchild's botanical setting.",
        website: "https://tropicalfloralmiami.com",
        phone: "(305) 555-0101",
      },
      {
        name: "Blooms & Botanicals",
        description: "Award-winning floral design studio with deep experience in garden weddings and outdoor ceremonies.",
        website: "https://bloomsandbotanicals.com",
        phone: "(305) 555-0142",
      },
    ],
  },
  {
    id: "photography",
    label: "Photography & Video",
    emoji: "📷",
    vendors: [
      {
        name: "Garden Light Photography",
        description: "Fine art wedding photographers specializing in natural-light botanical garden settings.",
        website: "https://gardenlightphoto.com",
        phone: "(786) 555-0201",
      },
      {
        name: "Coral Gables Films",
        description: "Cinematic wedding videography capturing the magic of garden ceremonies.",
        website: "https://coralgablesfilms.com",
        phone: "(786) 555-0234",
      },
    ],
  },
  {
    id: "music",
    label: "Music & Entertainment",
    emoji: "🎶",
    vendors: [
      {
        name: "Miami String Quartet",
        description: "Elegant string quartet perfect for outdoor ceremonies and cocktail hours.",
        phone: "(305) 555-0301",
        email: "info@miamistringquartet.com",
      },
      {
        name: "South Florida DJ Collective",
        description: "Professional DJs experienced with outdoor venue acoustics and sound setup.",
        website: "https://sfdjcollective.com",
        phone: "(305) 555-0345",
      },
    ],
  },
  {
    id: "officiant",
    label: "Officiants",
    emoji: "🪄",
    vendors: [
      {
        name: "Sacred Unions Miami",
        description: "Non-denominational officiants providing personalized ceremonies for couples of all backgrounds.",
        website: "https://sacredunionsmiami.com",
        phone: "(305) 555-0401",
      },
    ],
  },
  {
    id: "hair_makeup",
    label: "Hair & Makeup",
    emoji: "💄",
    vendors: [
      {
        name: "Blossom Bridal Beauty",
        description: "On-location bridal hair and makeup services available throughout South Florida.",
        website: "https://blossombridalbeauty.com",
        phone: "(305) 555-0501",
      },
      {
        name: "Radiance Bridal Studio",
        description: "Full-service bridal party hair and makeup with a dedicated on-site team.",
        phone: "(786) 555-0512",
        email: "hello@radiancebridalmia.com",
      },
    ],
  },
];
