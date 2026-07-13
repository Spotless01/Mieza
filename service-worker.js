const CACHE_NAME = "mieza-cache-v2";

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

  event.respondWith(

    caches.match(event.request)

      .then(async cached => {

        if (cached) {
          return cached;
        }

        try {

          const networkResponse =
            await fetch(event.request);

          const cache =
            await caches.open(CACHE_NAME);

          cache.put(
            event.request,
            networkResponse.clone()
          );

          return networkResponse;

        }

        catch (err) {

          console.log(
            "Fetch failed:",
            event.request.url
          );

          if (
            event.request.mode ===
            "navigate"
          ) {

            return caches.match(
              "/index.html"
            );

          }

          return new Response(
            "Offline",
            {
              status: 503
            }
          );

        }

      })

  );

});