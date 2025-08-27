const CACHE_NAME = 'berry-events-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

const CACHE_FIRST_RESOURCES = [
  '/icons/',
  '/favicon.ico'
];

const NETWORK_FIRST_RESOURCES = [
  '/api/'
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

// Fetch event with strategy-based routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network first for API requests
  if (NETWORK_FIRST_RESOURCES.some(resource => url.pathname.startsWith(resource))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache first for static assets
  if (CACHE_FIRST_RESOURCES.some(resource => url.pathname.startsWith(resource))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network first with fallback
  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Resource not found', { status: 404 });
  }
}

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