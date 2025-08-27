import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Smartphone, 
  Wifi, 
  Bell, 
  CheckCircle,
  X 
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsVisible(false);
    };

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if running in PWA mode
    if (window.navigator && (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    const userChoice = await installPrompt.userChoice;

    if (userChoice.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or user dismissed in this session
  if (isInstalled || !isVisible || !installPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <Card className="border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Install Berry Events</CardTitle>
                <CardDescription className="text-xs">
                  Get the mobile app experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              Works offline
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Bell className="h-3 w-3 mr-1" />
              Push notifications
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Faster loading
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 h-8 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="h-8 text-xs px-3"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}