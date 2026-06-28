// Z.XTREAM Service Worker - Push Notifications
const CACHE_NAME = 'zxtream-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Push notification received
self.addEventListener('push', (event) => {
  let data = { title: 'Z.XTREAM', body: 'New update!', icon: '/images/logo.png', url: '/home' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/images/logo.png',
    badge: data.badge || '/images/logo.png',
    image: data.image,
    data: { url: data.url || '/home' },
    tag: data.tag || 'zxtream-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Nonton Sekarang', icon: '/images/logo.png' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/anime/latest-updates');
    const data = await response.json();
    if (data.success && data.data?.length > 0) {
      // Notify about latest updates
      for (const ep of data.data.slice(0, 3)) {
        self.registration.showNotification(`📺 ${ep.title} - ${ep.episode}`, {
          body: ep.message || `Episode ${ep.episodeNum} baru rilis!`,
          icon: ep.thumbnail || '/images/logo.png',
          tag: `episode-${ep.slug}-${ep.episodeNum}`,
          data: { url: `/watch/${ep.slug}-episode-${ep.episodeNum}-subtitle-indonesia` },
        });
      }
    }
  } catch {}
}
