// Service Worker for Nyatet Gan (Offline-First PWA)
const CACHE_VERSION = 'v2.0.0';
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

// Install Event: Precache core shell dengan cache-busting agar selalu dapat versi terbaru
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(async (cache) => {
        await Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            fetch(url, { cache: 'no-store' })
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
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Hapus seluruh cache versi lama & langsung ambil alih kontrol halaman
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE_NAME && key !== RUNTIME_CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Pastikan tampilan offline selalu identik dengan tampilan online terbaru
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (
    url.origin !== self.location.origin ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('turbopack-hmr') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return;
  }

  // 1. Navigation requests (HTML halaman): Network-First, lalu simpan berdasarkan pathname
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(url.pathname, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const runtimeCache = await caches.open(RUNTIME_CACHE_NAME);
          const runtimeMatch = await runtimeCache.match(url.pathname);
          if (runtimeMatch) return runtimeMatch;

          const anyMatch = await caches.match(url.pathname);
          if (anyMatch) return anyMatch;

          const cachedRoot =
            (await runtimeCache.match('/')) || (await caches.match('/'));
          if (cachedRoot) return cachedRoot;

          return new Response(
            '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline - Nyatet Gan</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#F4F2EE;color:#191919;text-align:center;padding:20px}h1{font-size:1.5rem;margin-bottom:8px}p{font-size:0.9rem;color:#56687A}</style></head><body><div><h1>Sedang Offline</h1><p>Halaman ini belum tersimpan di cache. Silakan hubungkan kembali internet Anda atau buka halaman utama.</p><a href="/" style="display:inline-block;margin-top:16px;padding:8px 16px;background:#0A66C2;color:#fff;border-radius:8px;text-decoration:none">Ke Beranda</a></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. Next.js Static Chunks (_next/static/...): Stale-While-Revalidate agar selalu mutakhir
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 3. Aset statis: Gambar, ikon, manifest, font, CSS
  const isStaticAsset = url.pathname.match(
    /\.(png|jpg|jpeg|svg|gif|ico|webp|woff|woff2|ttf|eot|css|webmanifest|json)$/
  );
  if (isStaticAsset) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 4. Request lainnya (Next.js RSC payload dll): Network-First dengan fallback cache
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
        return new Response('', { status: 503, statusText: 'Offline' });
      })
  );
});
