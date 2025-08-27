import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download,
  Share,
  Settings,
  TestTube
} from 'lucide-react';

export default function MobileFeatures() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const {
    isSupported,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  } = usePushNotifications();

  useEffect(() => {
    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Check if app is already installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running as PWA
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Berry Events - Home Services',
          text: 'All your Home Services In One - Premium domestic services marketplace',
          url: window.location.origin
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile App Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Connection Status</span>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          <Separator />

          {/* Push Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <Bell className="h-4 w-4 text-blue-500" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium">Push Notifications</span>
              </div>
              <Switch
                checked={isSubscribed}
                onCheckedChange={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                disabled={!isSupported}
              />
            </div>
            
            {!isSupported && (
              <p className="text-xs text-gray-500">
                Push notifications not supported on this browser
              </p>
            )}

            {isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                className="w-full flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Send Test Notification
              </Button>
            )}
          </div>

          <Separator />

          {/* App Installation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Install App</span>
              </div>
              {isInstalled && (
                <Badge variant="secondary">Installed</Badge>
              )}
            </div>

            {installPrompt && !isInstalled && (
              <Button
                onClick={handleInstallApp}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Install Berry Events App
              </Button>
            )}

            {isInstalled && (
              <p className="text-xs text-green-600">
                App is installed and running as PWA
              </p>
            )}
          </div>

          <Separator />

          {/* Share App */}
          <Button
            variant="outline"
            onClick={handleShareApp}
            className="w-full flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Share App
          </Button>
        </CardContent>
      </Card>

      {/* Offline Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offline Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Browse services and providers
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            View previous bookings
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Save bookings (sync when online)
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Real-time features require connection
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-3 w-3 text-blue-500" />
              Booking confirmations
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-3 w-3 text-green-500" />
              Provider arrival updates
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-3 w-3 text-orange-500" />
              Service completion alerts
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-3 w-3 text-purple-500" />
              Special offers & promotions
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}