// Version auto-read from ?v= query param set by app.html registration
const _swVer = new URL(self.location).searchParams.get('v') || '4.28.0';
const CACHE = 'rian-v' + _swVer;
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

  const title = data.title || 'FieldLog Reminder';
  const options = {
    body: data.body || '',
    icon: BASE + 'icon-192.png',
    badge: BASE + 'badge-bell.png',
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
    // Store noteId for the app to read on load (cache + URL hash, both checked).
    // Two channels because either alone has been observed to fail in production:
    //   - Cache: works if storage is intact, but app load > 5 min misses it.
    //   - URL hash: survives any storage clear, but only fires on fresh window open.
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
        return clients.openWindow(BASE + 'app.html' + (noteId ? '#note=' + encodeURIComponent(noteId) : ''));
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

const ALLOWED_CDN_HOSTS = [
  'www.gstatic.com',
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'esm.sh',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAllowedCDN = ALLOWED_CDN_HOSTS.includes(url.hostname);

  if (!isSameOrigin && !isAllowedCDN) return;

  // Cache GET requests; ignore Firestore WebSocket, analytics, or Google Auth POSTs
  if (e.request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Stale-while-revalidate: serve from cache instantly, refresh the cache in the
  // background. In weak-signal areas the old network-first strategy stalled on every
  // request (20-60s OS timeout each) before falling back to cache. Trade-off: after
  // a deploy, users get the new version on the launch after next, not immediately.
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok || res.type === 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      if (cached) {
        e.waitUntil(network.catch(() => { }));
        return cached;
      }
      return network.catch(() => caches.match(e.request));
    })
  );
});
