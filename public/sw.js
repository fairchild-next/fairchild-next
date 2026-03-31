/**
 * Fairchild PWA Service Worker
 * Caches static assets (images, JS, CSS) for offline / low-signal use in the garden.
 */
const CACHE_VERSION = "fairchild-v2";

// Paths to cache on first fetch (images and static assets)
const ASSET_PATTERNS = ["/events/", "/stock/", "/map/", "/scheduled-admission", "/logo", "/hero", "/window.svg", "/manifest.json"];

function shouldCacheAsset(url) {
  const path = new URL(url).pathname;
  return ASSET_PATTERNS.some((p) => path.startsWith(p) || path.includes(p));
}

// Don't cache API or auth
function shouldSkipCache(url) {
  const path = new URL(url).pathname;
  return path.startsWith("/api/") || path.startsWith("/_next/data/");
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (shouldSkipCache(url)) return;

  // Only cache images - avoids stale HTML/JS causing scroll or layout issues
  const isImage = event.request.destination === "image" || /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/.test(url.pathname);
  if (isImage || shouldCacheAsset(url)) {
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

  // Don't cache HTML or JS - ensures fresh page loads and avoids scroll bugs
});
