// components/screens/HomeScreen.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { getPosts, type SavedPost } from '@/lib/storage';
import { TEMPLATES, type TemplateId } from '@/lib/templates';
import { DEFAULT_CONFIG } from '@/lib/types';
import TemplatePreview from '../TemplatePreview';
import { useUser } from '@/lib/useUser';

type Props = {
  onNewPost: () => void;
  onPickTemplate?: (id: TemplateId) => void;
  onOpenPost?: (id: string) => void;
  refreshKey?: number;
};

const HERO_TEMPLATES: TemplateId[] = ['splitQuote', 'editorialCover', 't3ch'];

export default function HomeScreen({
  onNewPost,
  onPickTemplate,
  onOpenPost,
  refreshKey = 0,
}: Props) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const { name } = useUser();

  useEffect(() => {
    setPosts(getPosts().slice(0, 6));
  }, [refreshKey]);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_TEMPLATES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const heroTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === HERO_TEMPLATES[heroIndex]),
    [heroIndex]
  );

  const greeting = name ? `Hey ${name} 👋` : 'Hey there 👋';

  return (
    <div className="px-5 py-6 screen-in">
      <section className="fade-up" style={{ animationDelay: '0ms' }}>
        <h2 className="text-2xl font-bold">{greeting}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          What are we making today?
        </p>
      </section>

      {heroTemplate && onPickTemplate && (
        <section className="mt-6 fade-up" style={{ animationDelay: '80ms' }}>
          <div
            className="rounded-3xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-10 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative flex items-center gap-4">
              <div
                key={heroTemplate.id}
                className="fade-in shrink-0 rounded-2xl overflow-hidden shadow-2xl"
                style={{ animationDuration: '0.5s' }}
              >
                <TemplatePreview
                  templateId={heroTemplate.id}
                  baseConfig={DEFAULT_CONFIG}
                  width={120}
                />
              </div>

              <div className="flex-1 min-w-0 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  ✨ Featured template
                </p>
                <h3 className="text-xl font-bold mt-1.5 leading-tight">
                  {heroTemplate.name}
                </h3>
                <p className="text-[11px] opacity-90 mt-1 line-clamp-2">
                  {heroTemplate.tagline}
                </p>

                <button
                  onClick={() => onPickTemplate(heroTemplate.id)}
                  className="mt-3 px-4 py-2 rounded-xl bg-white font-bold text-xs active:scale-95 transition"
                  style={{ color: 'var(--accent)' }}
                >
                  Use this →
                </button>
              </div>
            </div>

            <div className="relative flex justify-center gap-1.5 mt-4">
              {HERO_TEMPLATES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === heroIndex ? 20 : 6,
                    height: 6,
                    background:
                      i === heroIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  }}
                  aria-label={`Show template ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {onPickTemplate && (
        <section className="mt-8 fade-up" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Start from a template
            </h3>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
            {TEMPLATES.slice(0, 6).map((t, i) => (
              <button
                key={t.id}
                onClick={() => onPickTemplate(t.id)}
                className="shrink-0 rounded-2xl p-2 transition active:scale-95 hover:scale-[1.02] fade-up"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  animationDelay: `${200 + i * 40}ms`,
                }}
              >
                <TemplatePreview
                  templateId={t.id}
                  baseConfig={DEFAULT_CONFIG}
                  width={100}
                />
                <p className="text-[10px] font-semibold mt-2 text-center truncate max-w-[100px]">
                  {t.emoji} {t.name}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 fade-up" style={{ animationDelay: '280ms' }}>
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Or start blank
        </h3>

        <button
          onClick={onNewPost}
          className="w-full py-5 rounded-2xl text-left px-5 relative overflow-hidden active:scale-[0.98] transition group"
          style={{
            background: 'var(--card)',
            border: '1px dashed var(--border)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-110"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              📸
            </div>
            <div className="flex-1">
              <p className="text-base font-bold">Quick create</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Upload a photo → write a headline
              </p>
            </div>
            <span className="text-lg" style={{ color: 'var(--text-muted)' }}>
              →
            </span>
          </div>
        </button>
      </section>

      <section className="mt-8 fade-up" style={{ animationDelay: '360ms' }}>
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Your recent posts
        </h3>

        {posts.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-3xl mb-2">🎨</p>
            <p className="text-sm font-semibold">Nothing saved yet</p>
            <p
              className="text-xs mt-1 max-w-[240px] mx-auto"
              style={{ color: 'var(--text-muted)' }}
            >
              Your designs will show up here once you save them
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
            {posts.map((post) => {
              const firstSlide = post.slides?.[0];
              const slideCount = post.slides?.length ?? 0;
              return (
                <button
                  key={post.id}
                  onClick={() => onOpenPost?.(post.id)}
                  className="shrink-0 rounded-2xl overflow-hidden relative transition active:scale-95"
                  style={{
                    width: 120,
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.previewDataUrl}
                    alt={firstSlide?.headline ?? ''}
                    className="w-full aspect-[4/5] object-cover"
                  />
                  {slideCount > 1 && (
                    <span
                      className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                    >
                      {slideCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}