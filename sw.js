// sw.js - Service Worker básico para activar la PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Responde directamente con la red
  event.respondWith(fetch(event.request));
});