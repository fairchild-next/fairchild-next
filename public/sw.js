/**
 * Fairchild PWA Service Worker
 * - Caches static assets for weak garden cell service
 * - Network-first /api/my-tickets with offline fallback
 * - Caches map API for wayfinding when signal is spotty
 */
const CACHE_VERSION = "fairchild-v4";
const TICKETS_CACHE = "fairchild-tickets-v1";
const MAP_CACHE = "fairchild-map-v1";

const ASSET_PATTERNS = [
  "/events/",
  "/stock/",
  "/map/",
  "/scheduled-admission",
  "/logo",
  "/hero",
  "/window.svg",
  "/manifest.json",
  "/garden-map-overlay",
];

function shouldCacheAsset(url) {
  const path = new URL(url).pathname;
  return ASSET_PATTERNS.some((p) => path.startsWith(p) || path.includes(p));
}

function isTicketsRoute(url) {
  return new URL(url).pathname === "/api/my-tickets";
}

function isMapApiRoute(url) {
  return new URL(url).pathname === "/api/map";
}

function isStaticAsset(url) {
  const path = new URL(url).pathname;
  return path.startsWith("/_next/static/");
}

function shouldSkipCache(url) {
  const path = new URL(url).pathname;
  return (
    (path.startsWith("/api/") && !isTicketsRoute(url) && !isMapApiRoute(url)) ||
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
          .filter((k) => k !== CACHE_VERSION && k !== TICKETS_CACHE && k !== MAP_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function networkFirstWithCache(request, cacheName) {
  return fetch(request)
    .then((res) => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return res;
    })
    .catch(() =>
      caches.open(cacheName).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            new Response(JSON.stringify({ offline: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
        )
      )
    );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (shouldSkipCache(url.href)) return;

  if (isTicketsRoute(url.href)) {
    event.respondWith(networkFirstWithCache(event.request, TICKETS_CACHE));
    return;
  }

  if (isMapApiRoute(url.href)) {
    event.respondWith(networkFirstWithCache(event.request, MAP_CACHE));
    return;
  }

  if (isStaticAsset(url.href)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(event.request).then(
          (cached) =>
            cached ||
            fetch(event.request).then((res) => {
              if (res.ok) cache.put(event.request, res.clone());
              return res;
            })
        )
      )
    );
    return;
  }

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
  }
});
