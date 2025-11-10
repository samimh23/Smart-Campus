// Simple PWA Service Worker for Smart Campus
// Version 1.0.8 - Added backend endpoints for lessons/exercises!

const CACHE = "smart-campus-cache-v8";
const ASSETS = [
  "/student/dashboard",
  "/student/courses",
  "/student/homework",
  "/student/submissions",
  "/student/grades",
  "/student/quiz",
  "/student/add-quizz",
  "/student/examen",
  "/student/tutor",
  "/student/my-lessons",
  "/student/my-exercises",
  "/student/ai-tutor",
  "/student/explain",
  "/student/progress",
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
  self.skipWaiting(); // Force immediate activation
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

// Fetch event - cache pages AND quiz data
self.addEventListener("fetch", (event) => {
  const { request } = event;
  console.log("[SW] Fetching:", request.url);

  // Only cache GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip caching for chrome extensions
  if (request.url.startsWith("chrome-extension")) return;
  
  // Check if this is a quiz/exam API request that we want to cache
  const isQuizAPI = url.hostname === "localhost" && url.port === "3000" && 
                    (url.pathname === "/quiz" || 
                     url.pathname.startsWith("/quiz/") ||
                     url.pathname === "/exam" ||
                     url.pathname.startsWith("/exam/"));
  
  // Check if this is a tutor API request (lessons, exercises, progress)
  const isTutorAPI = url.hostname === "localhost" && url.port === "3000" && 
                     (url.pathname.startsWith("/tutor/"));
  
  // Combine both - cache quiz and tutor data
  const shouldCacheAPI = isQuizAPI || isTutorAPI;

  // Network-first strategy: Try network, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Cache student pages, static assets, AND quiz API data
        if (
          url.pathname.startsWith("/student/") ||
          url.pathname.startsWith("/auth") ||
          url.pathname.endsWith('.css') ||
          url.pathname.endsWith('.js') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.jpg') ||
          url.pathname.endsWith('.webmanifest') ||
          shouldCacheAPI  // 🎯 Cache quiz/exam/tutor API responses for offline!
        ) {
          console.log("[SW] 💾 Caching:", request.url);
          caches.open(CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(async () => {
        // If network fails, try cache
        const cached = await caches.match(request);
        if (cached) {
          console.log("[SW] 📦 Serving from cache (offline):", request.url);
          return cached;
        }
        
        console.warn("[SW] ⚠️ Fetch failed, no cache available:", url.pathname);
        
        // For API requests, return empty data so app doesn't break completely
        if (shouldCacheAPI) {
          console.log("[SW] 🔄 Returning empty data for offline API request");
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response("Offline - No cached version available", { status: 503 });
      })
  );
});