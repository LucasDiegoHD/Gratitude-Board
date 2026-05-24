// Minimal Service Worker to enable PWA installability (Add to Home Screen)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Apenas um bypass simples para a rede, que é o mínimo necessário para a maioria dos navegadores (como Chrome)
  // considerar a aplicação como um PWA instalável offline-capable.
  event.respondWith(fetch(event.request).catch(() => new Response('Você está offline.')));
});
