import type { NextConfig } from "next";

// Supabase project hostname for CSP (e.g. abc123.supabase.co)
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const securityHeaders = [
  // Prevent this app from being embedded in an iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent browsers from MIME-sniffing the content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin (no path) as referrer to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Disable browser features the app doesn't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // Content Security Policy
  // - unsafe-inline on scripts/styles: required by Next.js App Router hydration
  //   (upgrade path: generate per-request nonces via middleware)
  // - Stripe, Supabase, and MapLibre CDN tiles are explicitly whitelisted
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https://${supabaseHost} https://fairchildgarden.org https://www.fairchildgarden.org https://*.tile.openstreetmap.org https://*.maptiler.com`,
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.stripe.com`,
      "frame-src https://js.stripe.com",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
