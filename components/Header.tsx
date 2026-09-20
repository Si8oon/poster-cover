// components/Header.tsx
'use client';

import { useUser } from '@/lib/useUser';

export default function Header() {
  const { name } = useUser();
  const initial = name ? name.charAt(0).toUpperCase() : 'A';

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md safe-top"
      style={{
        background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="px-5 pb-4 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">
            Post Generator
          </h1>
          <p
            className="text-xs mt-0.5 truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            Create beautiful social posts
          </p>
        </div>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ml-3"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'var(--accent-fg)',
          }}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}