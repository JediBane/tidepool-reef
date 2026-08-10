import React from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import TidepoolReef from "./App.jsx";
import "./index.css";

/* Service worker updates.
   registerType is "autoUpdate", which only picks up a new build on page load — a device
   that keeps the app open runs a stale bundle indefinitely and appears to be missing
   features that already shipped. So: poll for updates while the app is open, and when a
   new service worker takes control, tell the app so it can offer a refresh. */
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, r) {
    if (!r) return;
    const check = () => r.update().catch(() => {});
    setInterval(check, 60 * 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
  },
});
if ("serviceWorker" in navigator) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.dispatchEvent(new CustomEvent("tr:update-ready"));
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TidepoolReef />
  </React.StrictMode>
);
