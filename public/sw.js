/**
 * Fairchild PWA Service Worker
 * - Caches static assets (images, JS, CSS) for offline / low-signal use in the garden.
 * - Network-first cache for /api/my-tickets so tickets are available offline.
 */
const CACHE_VERSION  = "fairchild-v3";
const TICKETS_CACHE  = "fairchild-tickets-v1";

// Max age for cached ticket data: 48 hours
const TICKETS_MAX_AGE_MS = 48 * 60 * 60 * 1000;

// Paths to cache on first fetch (images and static assets)
const ASSET_PATTERNS = ["/events/", "/stock/", "/map/", "/scheduled-admission", "/logo", "/hero", "/window.svg", "/manifest.json"];

function shouldCacheAsset(url) {
  const path = new URL(url).pathname;
  return ASSET_PATTERNS.some((p) => path.startsWith(p) || path.includes(p));
}

// Routes handled by the dedicated tickets network-first strategy
function isTicketsRoute(url) {
  const path = new URL(url).pathname;
  return path === "/api/my-tickets";
}

function shouldSkipCache(url) {
  const path = new URL(url).pathname;
  // Skip all API routes EXCEPT the ones we explicitly handle above
  return (
    (path.startsWith("/api/") && !isTicketsRoute(url)) ||
    path.startsWith("/_next/data/")
  );
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION && k !== TICKETS_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (shouldSkipCache(url.href)) return;

  // ── Tickets: network-first, fall back to cache ───────────────────────────
  if (isTicketsRoute(url.href)) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(TICKETS_CACHE).then((cache) => {
              // Store with a timestamp header so we can check staleness
              const headers = new Headers(clone.headers);
              headers.set("sw-cached-at", Date.now().toString());
              clone.text().then((body) => {
                const stamped = new Response(body, {
                  status: clone.status,
                  statusText: clone.statusText,
                  headers,
                });
                cache.put(event.request, stamped);
              });
            });
          }
          return res;
        })
        .catch(() =>
          caches.open(TICKETS_CACHE).then((cache) =>
            cache.match(event.request).then((cached) => {
              if (!cached) return new Response(JSON.stringify({ offline: true, currentTickets: [], pastTickets: [], visitCount: 0 }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
              // Return cached even if stale — better than nothing in the garden
              return cached;
            })
          )
        )
    );
    return;
  }

  // ── Images / static assets: cache-first ──────────────────────────────────
  const isImage =
    event.request.destination === "image" ||
    /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/.test(url.pathname);

  if (isImage || shouldCacheAsset(url.href)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Don't cache HTML or JS — ensures fresh page loads
});
