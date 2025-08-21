import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Smartphone, Calendar, MessageSquare, Star } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  bookingConfirmations: boolean;
  providerUpdates: boolean;
  paymentAlerts: boolean;
  reviewReminders: boolean;
  promotions: boolean;
  maintenanceUpdates: boolean;
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bookingConfirmations: true,
    providerUpdates: true,
    paymentAlerts: true,
    reviewReminders: true,
    promotions: false,
    maintenanceUpdates: false,
  });

  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const { toast } = useToast();

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Save to localStorage
    const newPrefs = { ...preferences, [key]: value };
    localStorage.setItem('notification-preferences', JSON.stringify(newPrefs));
    
    toast({
      title: "Preferences Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const getPermissionStatus = () => {
    if (!isSupported) return { text: "Not Supported", color: "bg-gray-500" };
    if (permission === 'granted') return { text: "Enabled", color: "bg-green-500" };
    if (permission === 'denied') return { text: "Blocked", color: "bg-red-500" };
    return { text: "Not Set", color: "bg-yellow-500" };
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h2>
        <p className="text-gray-600">
          Manage how you receive updates about your Berry Events services
        </p>
      </div>

      {/* Push Notification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Browser Notifications</Label>
              <p className="text-xs text-gray-500">
                Receive real-time updates on your device
              </p>
            </div>
            <Badge className={`${permissionStatus.color} text-white`}>
              {permissionStatus.text}
            </Badge>
          </div>

          {!isSupported && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your browser doesn't support push notifications. Please use a modern browser for the best experience.
              </p>
            </div>
          )}

          {isSupported && (
            <div className="flex flex-wrap gap-2">
              {permission !== 'granted' && (
                <Button
                  onClick={requestPermission}
                  disabled={isLoading}
                  size="sm"
                  data-testid="button-enable-notifications"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {isLoading ? "Requesting..." : "Enable Notifications"}
                </Button>
              )}

              {permission === 'granted' && !isSubscribed && (
                <Button
                  onClick={subscribe}
                  disabled={isLoading}
                  size="sm"
                  data-testid="button-subscribe-push"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {isLoading ? "Subscribing..." : "Subscribe to Push"}
                </Button>
              )}

              {isSubscribed && (
                <>
                  <Button
                    onClick={sendTestNotification}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    data-testid="button-test-notification"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                  
                  <Button
                    onClick={unsubscribe}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    data-testid="button-unsubscribe-push"
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    Unsubscribe
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="booking-confirmations" className="text-sm font-medium">
                    Booking Confirmations
                  </Label>
                  <p className="text-xs text-gray-500">
                    Confirmations, cancellations, and schedule changes
                  </p>
                </div>
              </div>
              <Switch
                id="booking-confirmations"
                checked={preferences.bookingConfirmations}
                onCheckedChange={(value) => handlePreferenceChange('bookingConfirmations', value)}
                data-testid="switch-booking-confirmations"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="provider-updates" className="text-sm font-medium">
                    Provider Updates
                  </Label>
                  <p className="text-xs text-gray-500">
                    Provider arrivals, delays, and completion notices
                  </p>
                </div>
              </div>
              <Switch
                id="provider-updates"
                checked={preferences.providerUpdates}
                onCheckedChange={(value) => handlePreferenceChange('providerUpdates', value)}
                data-testid="switch-provider-updates"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 text-orange-500 font-bold text-sm">R</div>
                <div>
                  <Label htmlFor="payment-alerts" className="text-sm font-medium">
                    Payment Alerts
                  </Label>
                  <p className="text-xs text-gray-500">
                    Payment confirmations and receipt notifications
                  </p>
                </div>
              </div>
              <Switch
                id="payment-alerts"
                checked={preferences.paymentAlerts}
                onCheckedChange={(value) => handlePreferenceChange('paymentAlerts', value)}
                data-testid="switch-payment-alerts"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <Label htmlFor="review-reminders" className="text-sm font-medium">
                    Review Reminders
                  </Label>
                  <p className="text-xs text-gray-500">
                    Reminders to rate and review completed services
                  </p>
                </div>
              </div>
              <Switch
                id="review-reminders"
                checked={preferences.reviewReminders}
                onCheckedChange={(value) => handlePreferenceChange('reviewReminders', value)}
                data-testid="switch-review-reminders"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 text-purple-500 font-bold text-sm">%</div>
                <div>
                  <Label htmlFor="promotions" className="text-sm font-medium">
                    Promotions & Offers
                  </Label>
                  <p className="text-xs text-gray-500">
                    Special deals, discounts, and seasonal promotions
                  </p>
                </div>
              </div>
              <Switch
                id="promotions"
                checked={preferences.promotions}
                onCheckedChange={(value) => handlePreferenceChange('promotions', value)}
                data-testid="switch-promotions"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 text-gray-500 font-bold text-sm">i</div>
                <div>
                  <Label htmlFor="maintenance-updates" className="text-sm font-medium">
                    System Updates
                  </Label>
                  <p className="text-xs text-gray-500">
                    App updates, maintenance notices, and feature announcements
                  </p>
                </div>
              </div>
              <Switch
                id="maintenance-updates"
                checked={preferences.maintenanceUpdates}
                onCheckedChange={(value) => handlePreferenceChange('maintenanceUpdates', value)}
                data-testid="switch-maintenance-updates"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-2">Notification Stats</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-bold text-blue-600">
                  {Object.values(preferences).filter(Boolean).length}
                </div>
                <div className="text-gray-600">Active Types</div>
              </div>
              <div>
                <div className="font-bold text-green-600">
                  {isSubscribed ? 'Connected' : 'Disconnected'}
                </div>
                <div className="text-gray-600">Push Status</div>
              </div>
              <div>
                <div className="font-bold text-purple-600">Real-time</div>
                <div className="text-gray-600">Delivery</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}