// components/ThemePicker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { THEMES, type ThemeId } from '@/lib/themes';

type Props = {
  current: ThemeId;
  onChange: (id: ThemeId) => void;
};

export default function ThemePicker({ current, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const currentTheme = THEMES.find((t) => t.id === current);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Moon button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition active:scale-90 hover:scale-105"
        style={{
          background: open
            ? 'var(--card-hover)'
            : 'color-mix(in srgb, var(--card) 80%, transparent)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'var(--shadow)',
        }}
        aria-label="Change theme"
        title="Change theme"
      >
        {currentTheme?.emoji ?? '🌙'}
      </button>

      {/* Floating panel */}
      {open && (
        <div
          className="absolute top-12 right-0 z-[200] rounded-2xl p-3 fade-in"
          style={{
            background: 'color-mix(in srgb, var(--card) 95%, transparent)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow)',
            width: 240,
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Pick a theme
          </p>

          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => {
              const isActive = t.id === current;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onChange(t.id);
                  }}
                  className="aspect-square rounded-xl flex items-center justify-center text-xl transition active:scale-90 hover:scale-105"
                  style={{
                    background: isActive ? 'var(--card-hover)' : 'transparent',
                    border: isActive
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border)',
                  }}
                  title={t.name}
                >
                  {t.emoji}
                </button>
              );
            })}
          </div>

          <p
            className="text-[10px] mt-3 px-1 leading-snug"
            style={{ color: 'var(--text-muted)' }}
          >
            <strong style={{ color: 'var(--text)' }}>{currentTheme?.name}</strong>
            <br />
            {currentTheme?.tagline}
          </p>
        </div>
      )}
    </div>
  );
}