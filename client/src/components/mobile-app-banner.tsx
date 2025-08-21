import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone, Bell } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function MobileAppBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if banner was previously dismissed
    const bannerDismissed = localStorage.getItem('app-banner-dismissed');
    if (bannerDismissed) {
      const dismissTime = parseInt(bannerDismissed);
      const daysSinceDismiss = (Date.now() - dismissTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) { // Show again after 7 days
        return;
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show banner after a delay to not be intrusive
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check notification permissions
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
      setShowBanner(false);
      // Enable notifications after install
      requestNotificationPermission();
    } else {
      console.log('PWA install dismissed');
    }

    setDeferredPrompt(null);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Register for push notifications
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push notifications (would need VAPID keys in production)
        // For now, show a success message
        new Notification('Berry Events', {
          body: 'Push notifications enabled! You\'ll get updates about your bookings.',
          icon: '/icons/icon-192x192.png'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('app-banner-dismissed', Date.now().toString());
  };

  // Don't show banner if app is installed
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            <span className="font-medium text-sm">Install App</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white ml-2"
            data-testid="banner-dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-white/90 text-xs mb-3">
          Get faster booking and instant notifications about your services.
        </p>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100 flex-1 text-xs"
            data-testid="button-install-app"
          >
            <Download className="h-3 w-3 mr-1" />
            Install
          </Button>
          
          {!notificationsEnabled && (
            <Button
              onClick={requestNotificationPermission}
              size="sm"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 text-xs"
              data-testid="button-enable-notifications"
            >
              <Bell className="h-3 w-3 mr-1" />
              Notify
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}