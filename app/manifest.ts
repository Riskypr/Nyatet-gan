import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nyatet Gan — Catat Keuangan Pribadi',
    short_name: 'Nyatet Gan',
    description: 'Aplikasi pencatatan keuangan pribadi offline-first dengan tema earth tone yang menenangkan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#C86446',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
