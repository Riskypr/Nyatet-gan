// Service Worker for Nyatet Gan (Offline-First PWA)
const CACHE_VERSION = 'v1.0.3';
const STATIC_CACHE_NAME = `nyatet-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `nyatet-runtime-${CACHE_VERSION}`;

// Precache list: core app shell routes & static assets
const PRECACHE_ASSETS = [
  '/',
  '/transactions',
  '/wallets',
  '/budget',
  '/reports',
  '/settings',
  '/manifest.webmanifest',
  '/Logo.png',
  '/favicon.ico',
];

// Install Event: Precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      // Use allSettled so if any single URL fails, others still cache successfully
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => {
              if (res.ok) {
                return cache.put(url, res);
              }
            })
            .catch((err) => {
              console.warn(`[SW] Precache failed for ${url}:`, err);
            })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE_NAME && key !== RUNTIME_CACHE_NAME)
          .map((key) => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Offline-first with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Ignore cross-origin, HMR, chrome-extension, and websocket requests
  if (
    url.origin !== self.location.origin ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('turbopack-hmr') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return;
  }

  // 1. Navigation requests (Full HTML page loads / reloads / direct URLs)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: check exact match first
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          // Check by pathname (e.g. /transactions)
          const cachedByPath = await caches.match(url.pathname);
          if (cachedByPath) return cachedByPath;

          // Fallback to cached root '/'
          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;

          return new Response(
            '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline - Nyatet Gan</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#F4F2EE;color:#191919;text-align:center;padding:20px}h1{font-size:1.5rem;margin-bottom:8px}p{font-size:0.9rem;color:#56687A}</style></head><body><div><h1>Sedang Offline</h1><p>Halaman ini belum tersimpan di cache. Silakan hubungkan kembali internet Anda atau buka halaman utama.</p><a href="/" style="display:inline-block;margin-top:16px;padding:8px 16px;background:#0A66C2;color:#fff;border-radius:8px;text-decoration:none">Ke Beranda</a></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. Next.js Static Chunks (_next/static/...) -> Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Static assets: Images, icons, manifests, fonts
  const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|webp|woff|woff2|ttf|eot|css|webmanifest|json)$/);
  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached and refresh in background if online
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(STATIC_CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default: Network-First with Cache fallback (handles Next.js RSC requests / data fetches)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Try ignoring search params (useful for _rsc query hashes)
        const cachedIgnoreSearch = await caches.match(request, { ignoreSearch: true });
        if (cachedIgnoreSearch) return cachedIgnoreSearch;

        // If it's a pathname match
        return caches.match(url.pathname);
      })
  );
});
