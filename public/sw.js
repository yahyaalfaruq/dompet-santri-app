const CACHE_NAME = 'txapp-cache-v1';
const urlsToCache = [
  '/login.html',
  '/register.html',
  '/dashboard.html',
  '/manifest.json',
  '/sw.js',
  './dompet-santri.png',
  // Tambahkan file css dan js jika terpisah
];

// Install event: cache semua file yang diperlukan
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event: ambil dari cache dulu, kalau gak ada fetch dari network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Activate event: bersihkan cache lama jika ada
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});
