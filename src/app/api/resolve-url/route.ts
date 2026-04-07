import { NextResponse } from "next/server";

/**
 * GET /api/resolve-url?url=...
 * Follows redirects server-side and returns the final URL.
 * Used by the QR scanner to unwrap shortened links (qrco.de, qr.link, etc.)
 * so the scanner can extract the plant slug from the real destination URL.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  // Only follow http/https URLs
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FairchildScanner/1.0)" },
    });
    return NextResponse.json({ finalUrl: res.url });
  } catch {
    return NextResponse.json({ error: "Could not resolve URL" }, { status: 400 });
  }
}
