// components/screens/TemplatesScreen.tsx
'use client';

import { TEMPLATES, type TemplateId } from '@/lib/templates';

type Props = {
  onPick: (id: TemplateId) => void;
};

export default function TemplatesScreen({ onPick }: Props) {
  return (
    <div className="px-5 py-6 fade-in">
      <h2 className="text-2xl font-bold">Templates</h2>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        Pick a style to start with
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className="aspect-[4/5] rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-center transition active:scale-[0.98] hover:scale-[1.02]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <span className="text-4xl">{t.emoji}</span>
            <span className="text-sm font-semibold">{t.name}</span>
            <span
              className="text-[10px] leading-tight"
              style={{ color: 'var(--text-muted)' }}
            >
              {t.tagline}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}