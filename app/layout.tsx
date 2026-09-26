import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { AppShell } from '@/components/layout/AppShell';

const fontSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nyatet Gan — Catat Keuangan Pribadi',
  description: 'Aplikasi pencatatan keuangan pribadi offline-first & mobile-first dengan tema warna earth tone yang menenangkan.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nyatet Gan',
  },
};

export const viewport: Viewport = {
  themeColor: '#C86446',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('nyatet-theme') || 'system';
    var isDark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={fontSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg text-text-primary antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
