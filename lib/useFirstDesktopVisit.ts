// lib/useFirstDesktopVisit.ts
'use client';

import { useEffect, useState } from 'react';

const KEY = 'postgen:desktop-nav-seen:v1';

/**
 * Returns true on the very first desktop visit (after which the flag
 * is set and subsequent visits return false).
 *
 * Use this to trigger one-time animations.
 */
export function useFirstDesktopVisit() {
  const [isFirst, setIsFirst] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem(KEY);
    if (seen === '1') {
      setIsFirst(false);
    } else {
      setIsFirst(true);
      // Mark as seen after a short delay so the animation completes
      // even if the user navigates away quickly.
      const t = setTimeout(() => {
        localStorage.setItem(KEY, '1');
      }, 2500);
      return () => clearTimeout(t);
    }
  }, []);

  return isFirst;
}