'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'w-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 z-20',
        !isOnline
          ? 'bg-warning/15 text-warning border-b border-warning/30'
          : 'bg-secondary/15 text-secondary border-b border-secondary/30 animate-fade-in'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 shrink-0 text-warning animate-pulse" />
          <span>
            <strong>Mode Offline</strong> — Anda tetap dapat mencatat transaksi & melihat data secara normal. Data aman di perangkat ini.
          </span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-secondary" />
          <span>
            <strong>Koneksi Kembali</strong> — Anda kembali online.
          </span>
        </>
      )}
    </div>
  );
}
