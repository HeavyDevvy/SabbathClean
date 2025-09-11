import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, unregisterServiceWorker } from "./utils/pwa";

// In development, unregister service workers to prevent caching issues
if (import.meta.env.DEV) {
  unregisterServiceWorker();
} else {
  // Register service worker only in production
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(<App />);
