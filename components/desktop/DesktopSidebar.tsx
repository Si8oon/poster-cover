// components/desktop/DesktopSidebar.tsx
'use client';

import type { Tab } from '../AppShell';
import { useFirstDesktopVisit } from '@/lib/useFirstDesktopVisit';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  onCreate: () => void;
};

const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'posts',
    label: 'My Posts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function DesktopSidebar({ active, onChange, onCreate }: Props) {
  const isFirstVisit = useFirstDesktopVisit();
  const animate = isFirstVisit === true;

  // Stagger base
  const baseDelay = 0.35;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-5 px-8 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-2 px-3 py-2.5 rounded-full backdrop-blur-xl ${
          animate ? 'dock-scale-in' : ''
        }`}
        style={{
          background: 'color-mix(in srgb, var(--card) 85%, transparent)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {/* Logo */}
        <div
          className={animate ? 'brand-fade' : ''}
          style={{ animationDelay: animate ? '0.1s' : undefined }}
        >
          <button
            onClick={() => onChange('home')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 active:scale-95 transition"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              color: 'var(--accent-fg)',
            }}
            aria-label="Home"
          >
            P
          </button>
        </div>

        {/* Divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ background: 'var(--border)' }}
        />

        {/* Nav icons */}
        <nav className="flex items-center gap-0.5">
          {items.map((item, idx) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full transition-all ${
                  animate ? 'icon-rotate-in' : ''
                }`}
                style={{
                  background: isActive ? 'var(--card-hover)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  animationDelay: animate
                    ? `${baseDelay + idx * 0.07}s`
                    : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      'color-mix(in srgb, var(--card-hover) 60%, transparent)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                {item.icon}
                <span className="text-xs font-medium hidden xl:inline">
                  {item.label}
                </span>
                {/* Active dot */}
                {isActive && (
                  <span
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ background: 'var(--border)' }}
        />

        {/* Create button */}
        <button
          onClick={onCreate}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs active:scale-95 transition shrink-0 ${
            animate ? 'icon-rotate-in' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'var(--accent-fg)',
            animationDelay: animate ? `${baseDelay + items.length * 0.07}s` : undefined,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.92';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>

        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ml-1 shrink-0 ${
            animate ? 'brand-fade' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'var(--accent-fg)',
            animationDelay: animate ? '0.25s' : undefined,
          }}
        >
          A
        </div>
      </div>
    </div>
  );
}