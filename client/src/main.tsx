import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.pcss";
import { registerServiceWorker, unregisterServiceWorker } from "./utils/pwa";

// In development, unregister service workers to prevent caching issues
if (import.meta.env.DEV) {
  unregisterServiceWorker();
  
  // Suppress harmless Vite HMR WebSocket errors in Replit environment
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    // Suppress Vite HMR WebSocket connection errors (harmless in Replit)
    if (event.reason?.message?.includes("Failed to construct 'WebSocket'") && 
        event.reason?.message?.includes("localhost:undefined")) {
      event.preventDefault();
      return;
    }
    const reasonStr = typeof event.reason === 'string' ? event.reason : event.reason?.message || '';
    if (reasonStr.includes('Failed to fetch dynamically imported module') || reasonStr.includes('net::ERR_ABORTED')) {
      event.preventDefault();
      return;
    }
    // Call original handler for other errors
    if (originalUnhandledRejection) {
      originalUnhandledRejection.call(window, event);
    }
  };
  
  // Suppress specific console warnings in development
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args[0]?.toString() || '';
    // Suppress DialogContent accessibility warning (will be fixed in future update)
    if (msg.includes('Missing `Description`') && msg.includes('DialogContent')) {
      return;
    }
    originalWarn.apply(console, args);
  };
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = args[0]?.toString() || '';
    if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('net::ERR_ABORTED')) {
      return;
    }
    originalError.apply(console, args);
  };
} else {
  // Register service worker only in production
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(<App />);
