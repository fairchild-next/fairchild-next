import { NextResponse } from "next/server";

/**
 * GET /api/resolve-url?url=...
 * Follows redirects server-side and returns the final URL.
 * Used by the QR scanner to unwrap shortened links so the scanner
 * can extract the plant slug from the real destination URL.
 *
 * SECURITY: Only resolves URLs from an explicit allowlist of known
 * QR shortener hostnames used on Fairchild plant signs. This prevents
 * SSRF (Server-Side Request Forgery) against internal Vercel/AWS metadata.
 */

/**
 * Hostnames whose shortened URLs are printed on Fairchild plant signs.
 * Add new shortener domains here when Fairchild deploys new QR sign batches.
 */
const ALLOWED_HOSTNAMES = new Set([
  "qrco.de",
  "qr.link",
  "l.fairchildgarden.org",
  "fairchildgarden.org",
  "www.fairchildgarden.org",
  "fairchild-next.vercel.app",
]);

function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    // Reject IP addresses and localhost (internal network probing)
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.") ||
      host.endsWith(".internal") ||
      host.endsWith(".local")
    ) {
      return false;
    }
    return ALLOWED_HOSTNAMES.has(host);
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "URL not permitted" }, { status: 403 });
  }

  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "FairchildScanner/1.0" },
    });
    return NextResponse.json({ finalUrl: res.url });
  } catch {
    return NextResponse.json({ error: "Could not resolve URL" }, { status: 400 });
  }
}
