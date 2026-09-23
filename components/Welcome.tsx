// components/Welcome.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  WORLD_STYLES,
  ENERGY_LEVELS,
  DEFAULT_WORLD,
  getWorld,
  saveWorld,
  type UserWorld,
  type EnergyLevel,
} from '@/lib/world';
import WorldDecorations from './WorldDecorations';
import FlowerOfLife from './FlowerOfLife';
import ThemePicker from './ThemePicker';
import { useTheme } from '@/lib/useTheme';

type Props = {
  onDone: () => void;
};

type SlideId = 'welcome' | 'world' | 'features' | 'ready';

export default function Welcome({ onDone }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [world, setWorld] = useState<UserWorld>(DEFAULT_WORLD);
  const { theme, setTheme, loaded } = useTheme();

  useEffect(() => {
    setWorld(getWorld());
  }, []);

  useEffect(() => {
    saveWorld(world);
  }, [world]);

  if (!loaded) {
    return (
      <div
        className="fixed inset-0 z-[100]"
        style={{ background: 'var(--bg)' }}
      />
    );
  }

  const slides: SlideId[] = ['welcome', 'world', 'features', 'ready'];
  const currentSlide = slides[slideIndex];
  const isLast = slideIndex === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden fade-in"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${world.accentColor}22 0%, var(--bg) 70%)`,
        }}
      />

      {/* Background visual — flower OR butterflies */}
      {world.style === 'flower' ? (
        <FlowerOfLife color={world.accentColor} />
      ) : (
        <div className="relative z-10">
          <WorldDecorations world={world} />
        </div>
      )}

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <ThemePicker current={theme} onChange={setTheme} />
        <button
          onClick={onDone}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          Skip →
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto w-full">
        <div key={currentSlide} className="fade-up flex flex-col items-center w-full">
          {currentSlide === 'welcome' && <WelcomeSlide world={world} />}
          {currentSlide === 'world' && (
            <ChooseSlide
              world={world}
              onStyleChange={(s) => setWorld((w) => ({ ...w, style: s }))}
              onEnergyChange={(e) => setWorld((w) => ({ ...w, energy: e }))}
            />
          )}
          {currentSlide === 'features' && <FeaturesSlide />}
          {currentSlide === 'ready' && <ReadySlide world={world} />}
        </div>
      </div>

      {/* Bottom */}
      <div className="relative z-10 flex flex-col items-center gap-5 pb-10 px-6 w-full max-w-md mx-auto">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slideIndex ? 28 : 8,
                height: 8,
                background: i === slideIndex ? world.accentColor : 'var(--border)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="w-full flex gap-3">
          {slideIndex > 0 && (
            <button
              onClick={() => setSlideIndex((s) => s - 1)}
              className="flex-1 py-4 rounded-2xl font-semibold transition active:scale-[0.98]"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => (isLast ? onDone() : setSlideIndex((s) => s + 1))}
            className="flex-1 py-4 rounded-2xl font-semibold transition active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${world.accentColor}, ${world.accentColor}dd)`,
              color: '#ffffff',
              boxShadow: `0 12px 24px -8px ${world.accentColor}66`,
            }}
          >
            {isLast ? 'Get Started 🚀' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Slide 1 ----------
function WelcomeSlide({ world }: { world: UserWorld }) {
  return (
    <>
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-60"
          style={{ background: world.accentColor }}
        />
        <div
          className="relative w-28 h-28 rounded-3xl flex items-center justify-center text-6xl"
          style={{
            background: `linear-gradient(135deg, ${world.accentColor}, ${world.accentColor}99)`,
            boxShadow: `0 20px 40px -12px ${world.accentColor}66`,
          }}
        >
          👋
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight max-w-md">
        Welcome to Post Generator
      </h1>
      <p className="mt-5 text-base leading-relaxed max-w-sm" style={{ color: 'var(--text-muted)' }}>
        A free creative canvas for making posts that actually hit. No design skills needed.
      </p>
    </>
  );
}

// ---------- Slide 2: Choose your vibe ----------
function ChooseSlide({
  world,
  onStyleChange,
  onEnergyChange,
}: {
  world: UserWorld;
  onStyleChange: (s: 'flower' | 'butterflies') => void;
  onEnergyChange: (e: EnergyLevel) => void;
}) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Choose your vibe 🎨</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Two worlds. Pick the one that fits your energy.
        </p>
      </div>

      {/* Two big world buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {WORLD_STYLES.map((s) => {
          const active = world.style === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onStyleChange(s.id)}
              className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-3 transition active:scale-95"
              style={{
                background: active ? `${world.accentColor}22` : 'var(--card)',
                border: active
                  ? `2px solid ${world.accentColor}`
                  : '1px solid var(--border)',
              }}
            >
              <span className="text-4xl">{s.emoji}</span>
              <span className="text-sm font-bold">{s.label}</span>
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
                {s.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Energy — only show when butterflies is picked */}
      {world.style === 'butterflies' && (
        <div className="w-full max-w-md mt-6">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2 text-left"
            style={{ color: 'var(--text-muted)' }}
          >
            Motion
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ENERGY_LEVELS.map((e) => {
              const active = world.energy === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => onEnergyChange(e.id)}
                  className="py-2 rounded-xl flex flex-col items-center gap-0.5 transition active:scale-95"
                  style={{
                    background: active ? `${world.accentColor}22` : 'var(--card)',
                    border: active
                      ? `2px solid ${world.accentColor}`
                      : '1px solid var(--border)',
                  }}
                >
                  <span className="text-lg">{e.emoji}</span>
                  <span className="text-[10px] font-semibold">{e.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ---------- Slide 3 ----------
function FeaturesSlide() {
  const features = [
    { emoji: '📸', label: 'Upload', desc: 'Any photo' },
    { emoji: '✍️', label: 'Write', desc: 'Bold headlines' },
    { emoji: '🎨', label: 'Style', desc: 'Templates & fonts' },
    { emoji: '🚀', label: 'Export', desc: 'Crisp PNGs' },
  ];

  return (
    <>
      <h2 className="text-3xl font-bold mb-3">Everything in one place</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        A full creative studio in your pocket
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {features.map((f) => (
          <div
            key={f.label}
            className="rounded-2xl p-4 text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="text-3xl mb-2">{f.emoji}</div>
            <p className="font-bold text-base">{f.label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- Slide 4 ----------
function ReadySlide({ world }: { world: UserWorld }) {
  return (
    <>
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-70 pulse-ring"
          style={{ background: world.accentColor }}
        />
        <div
          className="relative w-28 h-28 rounded-3xl flex items-center justify-center text-6xl"
          style={{
            background: `linear-gradient(135deg, ${world.accentColor}, ${world.accentColor}99)`,
            boxShadow: `0 20px 40px -12px ${world.accentColor}99`,
          }}
        >
          🚀
        </div>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold leading-tight max-w-md">
        Ready to make something loud
      </h2>
      <p className="mt-5 text-base leading-relaxed max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Your world is saved. You can change it anytime in Settings.
      </p>
    </>
  );
}