const CACHE_NAME = "mieza-cache-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/shop-login.html",
  "/rider-login.html",
  "/admin-login.html",
  "/css/style.css",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// =====================
// INSTALL
// =====================

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))

  );

  self.skipWaiting();

});

// =====================
// ACTIVATE
// =====================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      )

    )

  );

  self.clients.claim();

});

// =====================
// FETCH
// =====================

self.addEventListener("fetch", event => {

  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Never cache API requests
  if (
    event.request.url.includes(
      "mieza.onrender.com/api/"
    )
  ) {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isAppCode = /\\.(js|css)$/i.test(requestUrl.pathname);

  // Always fetch JavaScript and CSS from the network first so deployed fixes
  // are not hidden behind an old service-worker cache entry.
  event.respondWith((async () => {
    if (isAppCode) {
      try {
        const fresh = await fetch(event.request, { cache: "no-store" });
        if (fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const cachedCode = await caches.match(event.request);
        return cachedCode || new Response("Application file unavailable offline", { status: 503 });
      }
    }

    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (err) {
      if (event.request.mode === "navigate") {
        return (await caches.match("/index.html")) || new Response("Offline", { status: 503 });
      }
      return new Response("Offline", { status: 503 });
    }
  })());

});