const CACHE_NAME = 'taurus-ops-v1';

const URLS_TO_CACHE = [
  '/taurus-registers/',
  '/taurus-registers/index.html',
  '/taurus-registers/vehicle_inspection_checklist_working.html',
  '/taurus-registers/forklift_checklist.html',
  '/taurus-registers/lifting_equipment_checklist.html',
  '/taurus-registers/ladders_checklist.html',
  '/taurus-registers/firefighting_checklist.html',
  '/taurus-registers/firstaid_checklist.html',
  '/taurus-registers/hygiene_facilities_checklist.html',
  '/taurus-registers/stacking_storage_checklist.html',
  '/taurus-registers/compressor_checklist.html',
  '/taurus-registers/manifest.json'
];

// Install: cache all pages
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET requests dynamically
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/taurus-registers/');
        }
      });
    })
  );
});
