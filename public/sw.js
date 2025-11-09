// Simple PWA Service Worker for AI Tutor
// Version 1.0.3

const CACHE = "ai-tutor-cache-v3";
const ASSETS = [
  "/dash/quiz",           // quiz page
  "/dash/exams",           // exam page
  "/dash",
  "/dash/explain",
  "/dash/examen",
  "/dash/add-quizz",
  "/auth",
  "/offline.html",
  "/manifest.webmanifest"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing and caching assets...");
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  // self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");

  event.waitUntil(
    // Delete old caches
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE) {
            console.log("[SW] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event - serve cached assets and handle quiz/exam caching
self.addEventListener("fetch", (event) => {
  const { request } = event;
  console.log("[SW] Fetching:", request.url);

  // Only cache GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests
  // if (url.origin !== self.location.origin) return;
  // if url inclu chrome-extension return
  if (request.url.startsWith("chrome-extension")) return;
  // Handle network fallback
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;  // serve from cache if available first

      try {
        const response = await fetch(request);
        // Cache /quiz and /exam responses for offline access
        if (
          url.pathname.startsWith("/quiz") ||
          url.pathname.startsWith("/exam") ||
          url.pathname.endsWith('.css') ||
          (url.pathname.endsWith('.js') )
        ) {

          const cache = await caches.open(CACHE);
          cache.put(request, response.clone());
        }

        return response;
      } catch (err) {
        if (cached) return cached; // i add this to serve from cache when request fails which means user is offline
        console.warn("[SW] Fetch failed, offline fallback:", url.pathname);
        // Fallback to offline page if available
        //const offlinePage = await caches.match("/offline.html");
        //return offlinePage || new Response("Offline", { status: 503 });
      }
    })

    // fetch(event.request)
    //   .then((response) => {
    //     // Clone the response because response streams can be used only once
    //     const resClone = response.clone();
    //     caches.open(CACHE_NAME).then((cache) => {
    //       cache.put(event.request, resClone);
    //     });
    //     return response;
    //   })
    //   .catch(() => {
    //     // If fetch fails (offline), return from cache if available
    //     return caches.match(event.request);
    //   })
  );
});