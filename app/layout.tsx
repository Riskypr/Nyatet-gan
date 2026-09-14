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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={fontSans.variable}>
      <body className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
