// Import Firebase SDKs for push messaging support
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Detect base path dynamically — works on GitHub Pages AND localhost
const BASE = self.location.pathname.replace(/sw\.js$/, '');

const CACHE = 'timesheet-v402';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'app.html',
  BASE + 'codes.json',
  BASE + 'exchanges.json',
  BASE + 'cabinets.json',
];

// Initialize Firebase in service worker context
firebase.initializeApp({
  apiKey: "AIzaSyBq-AMqqUwGgDZGk6F9TndyZaZZui8gPBY",
  authDomain: "eir-fieldlog.firebaseapp.com",
  projectId: "eir-fieldlog",
  storageBucket: "eir-fieldlog.firebasestorage.app",
  messagingSenderId: "670175047784",
  appId: "1:670175047784:web:b48dc899508a925652cbdd"
});

const fcmMessaging = firebase.messaging();

// Handle background FCM messages (when app is closed/backgrounded)
fcmMessaging.onBackgroundMessage((payload) => {
  console.log('[Rian SW] background message received:', payload);
  const data = payload.data || {};
  if (data.type === 'reminder') {
    self.registration.showNotification(data.title || 'Rian Reminder', {
      body: data.body || '',
      icon: BASE + 'icon-192.png',
      tag: 'rian-remind-' + (data.reminderId || Date.now()),
      vibrate: [200, 100, 200],
      requireInteraction: true
    });
  }
});

self.addEventListener('install', e => {
  console.log('[Rian SW] installing, cache:', CACHE);
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      // Cache each asset individually — one failure won't abort the whole install
      await Promise.allSettled(ASSETS.map(url => c.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('[Rian SW] activating, cache:', CACHE);
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // NETWORK FIRST for HTML pages — always get latest version
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

  // CACHE FIRST for everything else (scripts, manifests, icons, etc.)
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

// Handle notification click — open or focus the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('app.html') || c.url.endsWith('/')) {
          return c.focus();
        }
      }
      return clients.openWindow(BASE + 'app.html');
    })
  );
});
