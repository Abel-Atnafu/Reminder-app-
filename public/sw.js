// Service Worker — handles Web Push notifications sent from the server.
// This runs outside the main page context, so it fires even when the tab is closed.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, tag, url } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: './favicon.svg',
      badge: './favicon.svg',
      tag: tag || 'reminder',
      data: { url: url || self.registration.scope },
      requireInteraction: false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.registration.scope;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
