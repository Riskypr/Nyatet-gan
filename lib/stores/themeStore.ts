import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'nyatet-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }

    const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    applyThemeToDOM(resolved);

    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const current = get().resolvedTheme;
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  initTheme: () => {
    if (typeof window === 'undefined') return;

    let saved: ThemeMode = 'system';
    try {
      const item = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (item && ['light', 'dark', 'system'].includes(item)) {
        saved = item;
      }
    } catch {
      saved = 'system';
    }

    const resolved: ResolvedTheme = saved === 'system' ? getSystemTheme() : saved;
    applyThemeToDOM(resolved);
    set({ theme: saved, resolvedTheme: resolved });

    // Listen to OS preference changes if system theme is selected
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (get().theme === 'system') {
        const newResolved = getSystemTheme();
        applyThemeToDOM(newResolved);
        set({ resolvedTheme: newResolved });
      }
    };

    try {
      mediaQuery.addEventListener('change', handleChange);
    } catch {
      mediaQuery.addListener(handleChange);
    }
  },
}));
