// components/NewPostSheet.tsx
'use client';

import { useEffect, useState } from 'react';
import { SLIDE_SETS, type SlideSetId } from '@/lib/slideSets';
import type { PostConfig } from '@/lib/types';
import TemplatePreview from './TemplatePreview';
import { DEFAULT_CONFIG } from '@/lib/types';

type Props = {
  onClose: () => void;
  onCreateSingle: () => void;
  onCreateSet: (slides: PostConfig[], themeId: SlideSetId) => void;
  /** Optional: start on the 'setConfig' step instead of 'choice' */
  initialStep?: 'choice' | 'setConfig';
  /** Optional: preselect a slide set */
  initialSetId?: SlideSetId;
};

type Step = 'choice' | 'setConfig';

const SLIDE_COUNTS = [3, 4, 5, 7, 10];

export default function NewPostSheet({
  onClose,
  onCreateSingle,
  onCreateSet,
  initialStep = 'choice',
  initialSetId,
}: Props) {
  const [step, setStep] = useState<Step>(initialStep);
  const [pickedSet, setPickedSet] = useState<SlideSetId>(initialSetId ?? 'editorial');
  const [slideCount, setSlideCount] = useState(4);

  // Sync if parent changes initial values while open
  useEffect(() => {
    if (initialSetId) setPickedSet(initialSetId);
  }, [initialSetId]);

  const handleCreateSet = () => {
    const def = SLIDE_SETS.find((s) => s.id === pickedSet);
    if (!def) return;
    const slides = def.generate(slideCount);
    onCreateSet(slides, pickedSet);
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/40 fade-in"
        style={{ backdropFilter: 'blur(4px)' }}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl slide-up"
        style={{
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <div className="max-w-[520px] mx-auto px-5 py-6">
          <div className="flex justify-center mb-5">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: 'var(--border)' }}
            />
          </div>

          {step === 'choice' && (
            <>
              <h2 className="text-xl font-bold">What are you creating?</h2>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Pick a starting point
              </p>

              <button
                onClick={onCreateSingle}
                className="w-full mt-6 p-4 rounded-2xl text-left transition active:scale-[0.98] flex items-center gap-4"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  📄
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">Single post</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    One slide, one message
                  </p>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </button>

              <button
                onClick={() => setStep('setConfig')}
                className="w-full mt-3 p-4 rounded-2xl text-left transition active:scale-[0.98] flex items-center gap-4 relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-white/20">
                  📚
                </div>
                <div className="flex-1 text-white">
                  <p className="text-base font-bold">Slide set</p>
                  <p className="text-xs mt-0.5 opacity-90">
                    Auto-generates a matching carousel
                  </p>
                </div>
                <span className="text-white">→</span>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
              </button>
            </>
          )}

          {step === 'setConfig' && (
            <>
              <button
                onClick={() => setStep('choice')}
                className="text-xs mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Back
              </button>

              <h2 className="text-xl font-bold">Build your slide set</h2>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                We'll generate the slides — you fill in the details
              </p>

              <div className="mt-6">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Pick a style
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SLIDE_SETS.map((s) => {
                    const isActive = pickedSet === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setPickedSet(s.id)}
                        className="rounded-2xl p-3 text-left transition active:scale-[0.98] flex flex-col items-center gap-2"
                        style={{
                          background: isActive
                            ? 'var(--card-hover)'
                            : 'var(--card)',
                          border: `1px solid ${
                            isActive ? 'var(--accent)' : 'var(--border)'
                          }`,
                        }}
                      >
                        <div
                          className="shrink-0 rounded-xl overflow-hidden"
                          style={{ border: '1px solid var(--border)' }}
                        >
                          <TemplatePreview
                            templateId={
                              s.id === 'editorial'
                                ? 'editorialCover'
                                : s.id === 'boldNews'
                                ? 't3ch'
                                : s.id === 'minimal'
                                ? 'editorialOutro'
                                : 'editorialCover'
                            }
                            baseConfig={DEFAULT_CONFIG}
                            width={120}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold">
                            {s.emoji} {s.name}
                          </p>
                          <p
                            className="text-[10px] mt-0.5 line-clamp-2"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {s.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  How many slides?
                </p>
                <div className="flex gap-2">
                  {SLIDE_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setSlideCount(n)}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold transition active:scale-95"
                      style={{
                        background:
                          slideCount === n ? 'var(--accent)' : 'var(--card)',
                        color:
                          slideCount === n
                            ? 'var(--accent-fg)'
                            : 'var(--text)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p
                  className="text-[10px] mt-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {slideCount} slides = 1 cover + {slideCount - 2} content + 1 outro
                </p>
              </div>

              <button
                onClick={handleCreateSet}
                className="w-full mt-6 py-4 rounded-2xl font-bold text-base transition active:scale-[0.98]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  color: 'var(--accent-fg)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                Create {slideCount}-slide set →
              </button>

              <div className="h-4" />
            </>
          )}
        </div>
      </div>
    </>
  );
}