// lib/useTheme.ts
'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_THEME, type ThemeId } from './themes';

const STORAGE_KEY = 'postgen:theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [loaded, setLoaded] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
    }
    setLoaded(true);
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    localStorage.setItem(STORAGE_KEY, id);
    document.documentElement.setAttribute('data-theme', id);
  };

  return { theme, setTheme, loaded };
}