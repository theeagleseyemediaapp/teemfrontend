// The Eagle's Eye Admin Portal Service Worker
const CACHE_NAME = "eagles-eye-admin-pwa-v1";
const PRECACHE_ASSETS = [
  "/admin",
  "/admin-manifest.webmanifest",
  "/admin-logo-192.png",
  "/admin-logo-512.png",
  "/admin-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[Admin SW] Precache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name.startsWith("eagles-eye-admin-")) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests within admin scope
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Network-first strategy for admin dynamic data, falling back to cache if offline
  if (url.pathname.startsWith("/admin") || url.pathname.includes("admin-logo")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
