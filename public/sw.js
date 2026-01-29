const CACHE_NAME = "fixmyindia-v1";
const STATIC_ASSETS = [
  "/",
  "/report/",
  "/solution/",
  "/offline/",
  "/globals.css",
  "/icons/icon-192x192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.url.includes("api.groq.com")) {
    return fetch(event.request).catch(() => {
      return new Response(
        JSON.stringify({
          error: "You are offline. Connect to internet to generate solutions.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    });
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((fetchResponse) => {
            if (fetchResponse.ok && fetchResponse.type === "basic") {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return fetchResponse;
          })
          .catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("/offline/");
            }
            return new Response("Offline", { status: 503 });
          })
      );
    }),
  );
});
