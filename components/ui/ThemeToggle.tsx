'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore, ThemeMode } from '@/lib/stores/themeStore';
import { cn } from '@/lib/utils/cn';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'segmented';
}

export function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, initTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initTheme();
    setMounted(true);
  }, [initTheme]);

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center opacity-60',
          className
        )}
      >
        <Sun className="w-4 h-4 text-text-muted" />
      </div>
    );
  }

  if (variant === 'segmented') {
    const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
      { value: 'light', label: 'Terang', icon: Sun },
      { value: 'dark', label: 'Gelap', icon: Moon },
      { value: 'system', label: 'Sistem', icon: Laptop },
    ];

    return (
      <div className={cn('flex items-center p-1 bg-surface-alt rounded-2xl border border-border gap-1', className)}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-surface text-primary shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-text-secondary')} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative w-9 h-9 rounded-xl bg-surface hover:bg-surface-alt border border-border flex items-center justify-center text-text-primary transition-all duration-150 active:scale-95 shadow-xs',
        className
      )}
      title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#E09E48] transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="w-4 h-4 text-primary transition-transform duration-200 rotate-0 scale-100" />
      )}
    </button>
  );
}
