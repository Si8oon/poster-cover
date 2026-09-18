// components/FAB.tsx
'use client';

export default function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="New post"
      className="absolute bottom-24 right-6 z-40 w-14 h-14 rounded-full active:scale-95 transition-all flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        color: 'var(--accent-fg)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}