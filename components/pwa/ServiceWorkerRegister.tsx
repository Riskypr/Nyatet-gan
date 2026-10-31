'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ServiceWorkerRegister() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Prefetch all primary routes so Next.js chunks are cached
    const coreRoutes = ['/', '/transactions', '/wallets', '/budget', '/reports', '/settings'];
    coreRoutes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {
        // Ignore prefetch errors
      }
    });

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Versi baru Nyatet Gan tersedia.');
              }
            });
          }
        });
      } catch (error) {
        console.error('[PWA] Gagal mendaftarkan Service Worker:', error);
      }
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, [router]);

  return null;
}
