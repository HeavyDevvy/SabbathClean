import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setSubscription(subscription.toJSON() as PushSubscription);
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications to receive booking updates",
          variant: "destructive"
        });
        return false;
      }

      // Generate VAPID keys (in production, these should be stored securely)
      const vapidPublicKey = await getVapidPublicKey();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const subscriptionJson = subscription.toJSON() as PushSubscription;
      setSubscription(subscriptionJson);
      setIsSubscribed(true);

      // Send subscription to server
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionJson)
      });

      toast({
        title: "Notifications Enabled",
        description: "You'll receive updates about your bookings and services"
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Unable to enable notifications. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setSubscription(null);
          setIsSubscribed(false);

          // Remove subscription from server
          await fetch('/api/push-subscription', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription.toJSON())
          });

          toast({
            title: "Notifications Disabled",
            description: "You won't receive push notifications anymore"
          });
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!isSubscribed || !subscription) {
      toast({
        title: "Not Subscribed",
        description: "Please enable notifications first",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          title: 'Berry Events Test',
          body: 'This is a test notification from your home services app!'
        })
      });

      toast({
        title: "Test Notification Sent",
        description: "Check your device for the notification"
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Failed to Send",
        description: "Unable to send test notification",
        variant: "destructive"
      });
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };
}

async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await fetch('/api/vapid-public-key');
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    // Fallback public key for development
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI50P8uo26xpgcNdNBNMwFm5oUiXdcWpxZXTQB7GDu1RMPajRO9N8TOwUo';
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}