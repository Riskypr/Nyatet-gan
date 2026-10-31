import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nyatet Gan — Catat Keuangan Pribadi',
    short_name: 'Nyatet Gan',
    description: 'Aplikasi pencatatan keuangan pribadi offline-first & mobile-first.',
    start_url: '/',
    scope: '/',
    id: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F4F2EE',
    theme_color: '#0A66C2',
    icons: [
      {
        src: '/Logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/Logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
