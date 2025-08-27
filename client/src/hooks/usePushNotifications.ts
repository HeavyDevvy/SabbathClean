import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: null,
    isSubscribed: false,
    subscription: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    if (isSupported) {
      setState(prev => ({ ...prev, isSupported: true }));
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        permission: Notification.permission,
        isSubscribed: !!subscription,
        subscription: subscription,
      }));
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!state.isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive updates about your bookings and services",
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings to receive updates",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Permission Error",
        description: "Could not request notification permission",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  const subscribe = async () => {
    if (!state.isSupported || state.permission !== 'granted') {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) return null;
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In production, you would use your own VAPID keys
      const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI8YlisLP7L1gqSV7h-P2zg7c9hqR9JhlL4MJFQ-Z2z7w8qM0dZV6OqYNo';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      await sendSubscriptionToServer(subscription);

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription: subscription,
      }));

      toast({
        title: "Subscribed!",
        description: "You'll now receive push notifications for booking updates",
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: "Subscription Failed",
        description: "Could not subscribe to push notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    return null;
  };

  const unsubscribe = async () => {
    if (!state.subscription) return;

    setIsLoading(true);

    try {
      await state.subscription.unsubscribe();
      
      // Remove subscription from server
      await removeSubscriptionFromServer(state.subscription);

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
      }));

      toast({
        title: "Unsubscribed",
        description: "You will no longer receive push notifications",
      });
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Could not unsubscribe from push notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!state.isSubscribed || !state.subscription) {
      toast({
        title: "Not Subscribed",
        description: "Please subscribe to notifications first",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: state.subscription,
        }),
      });

      toast({
        title: "Test Sent",
        description: "Check for a test notification",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test Failed",
        description: "Could not send test notification",
        variant: "destructive",
      });
    }
  };

  return {
    ...state,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
  } catch (error) {
    console.error('Error sending subscription to server:', error);
  }
}

async function removeSubscriptionFromServer(subscription: PushSubscription) {
  try {
    await fetch('/api/push-subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
  } catch (error) {
    console.error('Error removing subscription from server:', error);
  }
}