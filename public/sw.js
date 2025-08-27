const CACHE_NAME = 'berry-events-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Berry Events',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  const promiseChain = self.registration.showNotification('Berry Events', options);
  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app or navigate to specific page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
  // 'close' action or default click behavior
});

// Background sync for offline booking
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // Sync pending bookings when connection is restored
  const pendingBookings = await getStoredBookings();
  
  for (const booking of pendingBookings) {
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(booking)
      });
      
      // Remove from local storage after successful sync
      await removeStoredBooking(booking.id);
    } catch (error) {
      console.error('Failed to sync booking:', error);
    }
  }
}

async function getStoredBookings() {
  // Retrieve bookings from IndexedDB or localStorage
  return [];
}

async function removeStoredBooking(id) {
  // Remove booking from local storage
}