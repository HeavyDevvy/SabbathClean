import type { Express } from "express";
import webPush from "web-push";

// Generate VAPID keys - in production, store these securely
const vapidKeys = {
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI50P8uo26xpgcNdNBNMwFm5oUiXdcWpxZXTQB7GDu1RMPajRO9N8TOwUo',
  privateKey: 'aUdlrQhY8QoE_1OXmMqiMYXr01L5uUIr4nAHPyy-BMc'
};

// Configure web-push
webPush.setVapidDetails(
  'mailto:support@berryevents.co.za',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// In-memory storage for subscriptions (in production, use database)
let subscriptions: any[] = [];

export function registerPushNotificationRoutes(app: Express) {
  // Get VAPID public key
  app.get('/api/vapid-public-key', (req, res) => {
    res.json({
      publicKey: vapidKeys.publicKey
    });
  });

  // Subscribe to push notifications
  app.post('/api/push-subscription', (req, res) => {
    const subscription = req.body;
    
    // Store subscription (in production, save to database with user ID)
    subscriptions.push(subscription);
    
    res.status(201).json({ message: 'Subscription successful' });
  });

  // Unsubscribe from push notifications
  app.delete('/api/push-subscription', (req, res) => {
    const subscriptionToRemove = req.body;
    
    // Remove subscription from storage
    subscriptions = subscriptions.filter(sub => 
      sub.endpoint !== subscriptionToRemove.endpoint
    );
    
    res.json({ message: 'Unsubscription successful' });
  });

  // Send notification to specific subscription
  app.post('/api/send-notification', async (req, res) => {
    const { subscription, title, body, data } = req.body;

    const notificationPayload = {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data || {},
      actions: [
        {
          action: 'explore',
          title: 'View Details'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    try {
      await webPush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      );
      
      res.json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Send notification to all subscribers
  app.post('/api/broadcast-notification', async (req, res) => {
    const { title, body, data } = req.body;

    const notificationPayload = {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data || {},
      actions: [
        {
          action: 'explore',
          title: 'View Details'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    const results = [];
    
    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(
          subscription,
          JSON.stringify(notificationPayload)
        );
        results.push({ success: true, endpoint: subscription.endpoint });
      } catch (error) {
        console.error('Error sending to subscription:', error);
        results.push({ success: false, endpoint: subscription.endpoint, error: String(error) });
      }
    }

    res.json({
      message: `Notification sent to ${results.filter(r => r.success).length}/${subscriptions.length} subscribers`,
      results
    });
  });

  // Booking-specific notifications
  app.post('/api/send-booking-notification', async (req, res) => {
    const { bookingId, type, message, userSubscription } = req.body;

    const notificationTypes = {
      'booking_confirmed': {
        title: '🎉 Booking Confirmed!',
        body: message || 'Your service has been booked successfully'
      },
      'provider_assigned': {
        title: '👤 Provider Assigned',
        body: message || 'A service provider has been assigned to your booking'
      },
      'provider_enroute': {
        title: '🚗 Provider On The Way',
        body: message || 'Your service provider is heading to your location'
      },
      'service_started': {
        title: '🔧 Service Started',
        body: message || 'Your service has begun'
      },
      'service_completed': {
        title: '✅ Service Completed',
        body: message || 'Your service has been completed successfully'
      },
      'payment_processed': {
        title: '💳 Payment Processed',
        body: message || 'Your payment has been processed'
      },
      'review_request': {
        title: '⭐ Leave a Review',
        body: message || 'How was your service? Leave a review!'
      }
    };

    const notification = notificationTypes[type as keyof typeof notificationTypes] || {
      title: 'Berry Events Update',
      body: message
    };

    const notificationPayload = {
      ...notification,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { 
        bookingId,
        type,
        url: `/bookings/${bookingId}`
      },
      actions: [
        {
          action: 'view_booking',
          title: 'View Booking'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    try {
      if (userSubscription) {
        // Send to specific user
        await webPush.sendNotification(
          userSubscription,
          JSON.stringify(notificationPayload)
        );
      } else {
        // Broadcast to all subscribers (for promotional notifications)
        for (const subscription of subscriptions) {
          try {
            await webPush.sendNotification(
              subscription,
              JSON.stringify(notificationPayload)
            );
          } catch (error) {
            console.error('Error sending to subscription:', error);
          }
        }
      }
      
      res.json({ message: 'Booking notification sent successfully' });
    } catch (error) {
      console.error('Error sending booking notification:', error);
      res.status(500).json({ error: 'Failed to send booking notification' });
    }
  });
}