// components/Header.tsx
'use client';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md"
      style={{
        background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Post Generator</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Create beautiful social posts
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'var(--accent-fg)',
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}