// lib/useUser.ts
'use client';

import { useEffect, useState } from 'react';

const KEY = 'postgen:user-name';

export function useUser() {
  const [name, setNameState] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY) ?? '';
    setNameState(saved);
    setLoaded(true);
  }, []);

  const setName = (next: string) => {
    const clean = next.trim().slice(0, 30);
    setNameState(clean);
    localStorage.setItem(KEY, clean);
  };

  return { name, setName, loaded };
}