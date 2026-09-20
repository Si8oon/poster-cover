// components/screens/TemplatesScreen.tsx
'use client';

import { useState } from 'react';
import { TEMPLATES, type TemplateId } from '@/lib/templates';
import { DEFAULT_CONFIG } from '@/lib/types';
import TemplatePreview from '../TemplatePreview';

type Props = {
  onPick: (id: TemplateId) => void;
};

export default function TemplatesScreen({ onPick }: Props) {
  const [hovered, setHovered] = useState<TemplateId | null>(null);

  return (
    <div className="px-5 py-6 fade-in">
      <h2 className="text-2xl font-bold">Templates</h2>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        Pick a style to start with
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {TEMPLATES.map((t) => {
          const isHovered = hovered === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col text-left transition-all active:scale-[0.98]"
              style={{
                background: 'var(--card)',
                border: `1px solid ${
                  isHovered ? 'var(--accent)' : 'var(--border)'
                }`,
                borderRadius: '1rem',
                padding: '10px',
                boxShadow: isHovered ? 'var(--shadow)' : 'none',
                transform: isHovered ? 'translateY(-2px)' : 'none',
              }}
            >
              {/* Live preview */}
              <div className="w-full flex justify-center">
                <TemplatePreview
                  templateId={t.id}
                  baseConfig={DEFAULT_CONFIG}
                  width={160}
                />
              </div>

              {/* Info */}
              <div className="mt-3 flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p
                    className="text-[10px] leading-tight mt-0.5 line-clamp-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t.tagline}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}