// components/Welcome.tsx
'use client';

import { useState } from 'react';

type Props = {
  onDone: () => void;
};

const slides = [
  {
    emoji: '👋',
    title: 'Welcome to Post Generator',
    sub: 'Create beautiful social media posts in seconds — from any photo.',
    accent: true,
    bg: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
  },
  {
    emoji: '📸',
    title: 'Upload any photo',
    sub: "We auto-fit it perfectly. Portrait, landscape, square — doesn't matter.",
    bg: 'linear-gradient(135deg, #bae6fd, #a5f3fc)',
  },
  {
    emoji: '✍️',
    title: 'Write your headline',
    sub: "Pick a word to highlight. That's it. The layout handles the rest.",
    bg: 'linear-gradient(135deg, #fbcfe8, #f9a8d4)',
  },
  {
    emoji: '🎨',
    title: 'Pick your style',
    sub: 'Templates, fonts, colors, draggable elements — make it truly yours.',
    bg: 'linear-gradient(135deg, #fed7aa, #fdba74)',
  },
  {
    emoji: '🚀',
    title: 'Ready to create?',
    sub: 'Save your posts, download as PNG, and share them anywhere.',
    accent: true,
    bg: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
  },
];

export default function Welcome({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden fade-in"
      style={{ background: 'var(--bg)' }}
    >
      {/* Sky gradient background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `linear-gradient(180deg, #e0f2fe 0%, #fef3f8 50%, #fef9f0 100%)`,
        }}
      />

      {/* Sun */}
      <div className="pointer-events-none absolute top-10 right-12">
        <div
          className="w-24 h-24 rounded-full blur-md opacity-80"
          style={{ background: 'radial-gradient(circle, #fde68a, #fbbf24)' }}
        />
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60"
          style={{ background: '#fde68a' }}
        />
      </div>

      {/* Clouds */}
      <Cloud top="8%" left="5%" scale={1} delay={0} direction="right" />
      <Cloud top="14%" right="8%" scale={0.8} delay={1.5} direction="left" />
      <Cloud top="22%" left="20%" scale={0.6} delay={3} direction="right" />
      <Cloud bottom="18%" right="10%" scale={1.1} delay={2} direction="left" />
      <Cloud bottom="24%" left="8%" scale={0.7} delay={0.5} direction="right" />

      {/* Sparkles */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { top: '18%', left: '14%', delay: 0 },
          { top: '30%', right: '12%', delay: 0.5 },
          { top: '42%', left: '8%', delay: 1 },
          { top: '58%', right: '18%', delay: 1.5 },
          { top: '72%', left: '22%', delay: 2 },
          { top: '50%', right: '8%', delay: 0.8 },
          { bottom: '30%', left: '10%', delay: 1.2 },
          { bottom: '22%', right: '14%', delay: 0.3 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute text-2xl twinkle"
            style={{
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              animationDelay: `${s.delay}s`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Butterflies / birds */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[24%] left-[30%] text-2xl float opacity-70">🦋</div>
        <div className="absolute top-[60%] right-[22%] text-xl float-slow opacity-60">🌸</div>
        <div className="absolute bottom-[26%] left-[24%] text-xl bob opacity-70">🌷</div>
      </div>

      {/* Skip */}
      <div className="relative z-10 flex justify-end p-4">
        <button
          onClick={onDone}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-white/50"
          style={{ color: '#64748b' }}
        >
          Skip →
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center max-w-lg mx-auto w-full">
        <div key={step} className="fade-up flex flex-col items-center">
          {/* Main icon with animated gradient bg + glow */}
          <div className="relative mb-10">
            <div
              className="absolute inset-0 rounded-[2rem] blur-2xl opacity-60"
              style={{ background: current.bg }}
            />
            <div
              className="absolute inset-0 rounded-[2rem] pulse-ring"
              style={{ background: current.bg, opacity: 0.5 }}
            />
            <div
              className="relative w-32 h-32 rounded-[2rem] flex items-center justify-center text-6xl shadow-2xl transition-all duration-500"
              style={{
                background: current.bg,
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
              }}
            >
              {current.emoji}
            </div>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight max-w-md"
            style={{ color: '#1e293b', textWrap: 'balance' } as React.CSSProperties}
          >
            {current.title}
          </h1>
          <p
            className="mt-5 text-base sm:text-lg leading-relaxed max-w-sm"
            style={{ color: '#64748b' }}
          >
            {current.sub}
          </p>
        </div>
      </div>

      {/* Dots + buttons */}
      <div className="relative z-10 flex flex-col items-center gap-6 pb-12 px-8 w-full max-w-md mx-auto">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 28 : 8,
                height: 8,
                background: i === step ? '#8b5cf6' : 'rgba(0,0,0,0.1)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="w-full flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-4 rounded-2xl font-semibold transition active:scale-[0.98] bg-white/70 backdrop-blur hover:bg-white"
              style={{ color: '#475569', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              ← Back
            </button>
          )}

          <button
            onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
            className="flex-1 py-4 rounded-2xl font-semibold transition active:scale-[0.98] text-white shadow-xl"
            style={{
              background: current.bg,
              boxShadow: '0 12px 24px -8px rgba(139, 92, 246, 0.4)',
            }}
          >
            {isLast ? 'Get Started 🚀' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Cloud component */
function Cloud({
  top,
  left,
  right,
  bottom,
  scale = 1,
  delay = 0,
  direction = 'right',
}: {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  scale?: number;
  delay?: number;
  direction?: 'left' | 'right';
}) {
  return (
    <div
      className={`pointer-events-none absolute ${direction === 'right' ? 'drift' : 'drift-reverse'}`}
      style={{
        top,
        left,
        right,
        bottom,
        transform: `scale(${scale})`,
        animationDelay: `${delay}s`,
        opacity: 0.85,
      }}
    >
      <div className="relative">
        {/* Cloud made of overlapping circles */}
        <div className="w-24 h-10 bg-white rounded-full shadow-sm" />
        <div className="absolute -top-3 left-3 w-14 h-14 bg-white rounded-full" />
        <div className="absolute -top-5 left-9 w-20 h-20 bg-white rounded-full" />
        <div className="absolute -top-2 right-3 w-12 h-12 bg-white rounded-full" />
      </div>
    </div>
  );
}