// Service Worker for Berry Events PWA
const CACHE_NAME = 'berry-events-v1.0.0';
const OFFLINE_URL = '/offline';

// Resources to cache for offline functionality
const urlsToCache = [
  '/',
  '/booking',
  '/providers',
  '/offline',
  '/manifest.json',
  // Icons (using SVG placeholders)
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install Event processing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate Event processing');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients for current page');
      return self.clients.claim();
    })
  );
});

// Fetch handler - Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();
          
          // Cache successful API responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page for failed API requests
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle page requests
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful page responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached page if available
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for failed page requests
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push Received.');
  
  let notificationData = {
    title: 'Berry Events',
    body: 'You have a new update!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'berry-events-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      console.log('[SW] Error parsing push data:', e);
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click Received.');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Get URL from notification data
  const urlToOpen = event.notification.data?.url || '/';
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if app is already open
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync handler for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);
  
  if (event.tag === 'background-sync-bookings') {
    event.waitUntil(syncOfflineBookings());
  }
});

// Sync offline bookings when back online
async function syncOfflineBookings() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const offlineBookings = await cache.match('/offline-bookings');
    
    if (offlineBookings) {
      const bookings = await offlineBookings.json();
      
      // Sync each booking
      for (let booking of bookings) {
        try {
          await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
          });
        } catch (error) {
          console.error('[SW] Failed to sync booking:', error);
        }
      }
      
      // Clear offline bookings after sync
      await cache.delete('/offline-bookings');
      
      // Show sync success notification
      self.registration.showNotification('Berry Events', {
        body: 'Your offline bookings have been synced!',
        icon: '/icons/icon-192x192.png',
        tag: 'sync-complete'
      });
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}