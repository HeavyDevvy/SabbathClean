import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Providers from "@/pages/providers";
import Profile from "@/pages/profile";
import ProviderOnboarding from "@/pages/provider-onboarding";
import ProviderTraining from "@/pages/provider-training";
import NotFound from "@/pages/not-found";
import Offline from "@/pages/offline";
import Bookings from "@/pages/bookings";
import NotificationSettings from "@/components/notification-settings";
import MobileAppBanner from "@/components/mobile-app-banner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/providers" component={Providers} />
      <Route path="/provider-onboarding" component={ProviderOnboarding} />
      <Route path="/provider-training" component={ProviderTraining} />
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={NotificationSettings} />
      <Route path="/offline" component={Offline} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered: ', registration);
            
            // Check for service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available, show update notification
                    if (confirm('New app update available! Reload to get the latest features?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed: ', error);
          });
      });
    }

    // Handle online/offline events
    const handleOnline = () => {
      console.log('[PWA] Back online');
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          return registration.sync.register('background-sync-bookings');
        });
      }
    };

    const handleOffline = () => {
      console.log('[PWA] Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MobileAppBanner />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
