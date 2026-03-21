const CACHE = 'timesheet-v419';
const BASE = self.location.pathname.replace(/sw\.js$/, '');
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'app.html',
  BASE + 'codes.json',
  BASE + 'exchanges.json',
  BASE + 'cabinets.json',
];

// Handle push notifications (raw Web Push, no Firebase SDK needed)
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { /* ignore */ }
  console.log('[Rian SW] push received:', data);

  const title = data.title || 'Rian Reminder';
  const options = {
    body: data.body || '',
    icon: BASE + 'icon-192.png',
    tag: 'rian-remind-' + (data.reminderId || Date.now()),
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // Notify open clients for foreground toast
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(c => c.postMessage(data));
      });
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const noteId = e.notification.data && e.notification.data.noteId;
  e.waitUntil(
    // Store noteId for the app to read on load (hash/query params unreliable in PWA)
    (noteId
      ? caches.open('rian-pending-note').then(c =>
          c.put('/__pending_note__', new Response(JSON.stringify({ noteId, ts: Date.now() })))
        )
      : Promise.resolve()
    ).then(() =>
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        for (const c of list) {
          if (c.url.includes('app.html') || c.url.endsWith('/')) {
            if (noteId) c.postMessage({ type: 'openNote', noteId });
            return c.focus();
          }
        }
        return clients.openWindow(BASE + 'app.html');
      })
    )
  );
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      await Promise.allSettled(ASSETS.map(url => c.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
