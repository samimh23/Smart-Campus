"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    // Only register the SW in secure contexts (HTTPS) or on localhost during dev
    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);
        })
        .catch((err) => {
          console.error("[SW] Registration failed:", err);
        });
    }
  }, []);

  return null;
}