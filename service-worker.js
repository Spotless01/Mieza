const CACHE_NAME = "mieza-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/cart.js",
  "/js/shops.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});