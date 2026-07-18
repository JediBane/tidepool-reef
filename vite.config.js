import { defineConfig } from "vite";
import pkg from "./package.json";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",   // new deploys take effect on next launch, no stale-app purgatory
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon.png"],
      manifest: {
        name: "Tidepool Reef",
        short_name: "Tidepool",
        description: "Track your reef, get AI diagnosis, and ID any coral from a photo — with a species library built by real reefers, not scraped from stores.",
        id: "/",
        start_url: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#03080c",
        theme_color: "#03080c",
        categories: ["lifestyle", "utilities"],
        icons: [
          { src: "/icons/icon-64.png", sizes: "64x64", type: "image/png" },
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Log a test", url: "/?view=log", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
          { name: "Ask DeepDive", url: "/?view=deepdive", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
        ],
      },
      workbox: {
        // Precache the app shell (js/css/html/fonts) but NOT the 100+ species photos —
        // those cache lazily on first view instead of bloating install.
        globPatterns: ["**/*.{js,css,html,woff2}"],
        globIgnores: ["species/**"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Supabase + our AI proxy: ALWAYS network. Never serve stale tank data or canned AI.
            urlPattern: ({ url }) =>
              url.hostname.endsWith(".supabase.co") || url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
          },
          {
            // Species photos: cache-first, they never change once bundled
            urlPattern: ({ url }) => url.pathname.startsWith("/species/"),
            handler: "CacheFirst",
            options: {
              cacheName: "species-images",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
          {
            // Wikipedia photo fallbacks + Google fonts: stale-while-revalidate
            urlPattern: ({ url }) =>
              url.hostname.includes("wikipedia.org") || url.hostname.includes("wikimedia.org") ||
              url.hostname.includes("gstatic.com") || url.hostname.includes("googleapis.com"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "external-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
