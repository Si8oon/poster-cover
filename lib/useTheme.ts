// lib/useTheme.ts
'use client';

import { useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME, type ThemeId } from './themes';

const STORAGE_KEY = 'postgen:theme';

function applyTheme(id: ThemeId) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', id);
}

function pickRandomTheme(): ThemeId {
  const random = THEMES[Math.floor(Math.random() * THEMES.length)];
  return random.id;
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [loaded, setLoaded] = useState(false);

  // On mount: either read saved theme, or pick a random one for the first visit
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;

    if (saved) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      // First visit → pick a random theme and save it
      const random = pickRandomTheme();
      localStorage.setItem(STORAGE_KEY, random);
      setThemeState(random);
      applyTheme(random);
    }
    setLoaded(true);
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    localStorage.setItem(STORAGE_KEY, id);
    applyTheme(id);
  };

  return { theme, setTheme, loaded };
}