// components/desktop/DesktopHome.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPosts, type SavedPost } from '@/lib/storage';
import { TEMPLATES, type TemplateId } from '@/lib/templates';
import { SLIDE_SETS, type SlideSetId } from '@/lib/slideSets';
import { DEFAULT_CONFIG } from '@/lib/types';
import TemplatePreview from '../TemplatePreview';
import { useUser } from '@/lib/useUser';

type Props = {
  onCreate: () => void;
  onPickTemplate: (id: TemplateId) => void;
  onOpenPost: (id: string) => void;
  onOpenSlideSet: (id: SlideSetId) => void;
  onOpenTemplates: () => void;
  refreshKey?: number;
};

export default function DesktopHome({
  onCreate,
  onPickTemplate,
  onOpenPost,
  onOpenSlideSet,
  onOpenTemplates,
  refreshKey = 0,
}: Props) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const { name } = useUser();

  useEffect(() => {
    setPosts(getPosts().slice(0, 5));
  }, [refreshKey]);

  const greeting = name ? `Welcome back, ${name} 👋` : 'Welcome back 👋';

  return (
    <div className="px-10 py-10 fade-in max-w-[1400px] mx-auto">
      {/* ---------- Header ---------- */}
      <div className="mb-10 fade-up" style={{ animationDelay: '0ms' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {greeting}
        </p>
        <h1 className="text-4xl font-bold mt-1">What will you create today?</h1>
      </div>

      {/* ---------- QUICK-START ROW ---------- */}
      <section className="mb-12 fade-up" style={{ animationDelay: '80ms' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickCard
            emoji="📄"
            title="Single post"
            sub="One slide, one message"
            onClick={onCreate}
          />
          <QuickCard
            emoji="📚"
            title="Slide set"
            sub="Auto-generate 4-10 slides"
            accent
            onClick={() => onOpenSlideSet('editorial')}
          />
          <QuickCard
            emoji="✨"
            title="Templates"
            sub="Browse 11 designs"
            onClick={onOpenTemplates}
          />
          <QuickCard
            emoji="📸"
            title="From photo"
            sub="Just upload and go"
            onClick={onCreate}
          />
        </div>
      </section>

      {/* ---------- RECENT POSTS ---------- */}
      <section className="mb-12 fade-up" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Your recent posts</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          <button
            onClick={onCreate}
            className="aspect-[4/5] rounded-3xl flex flex-col items-center justify-center gap-3 transition active:scale-95 hover:scale-[1.02]"
            style={{ background: 'var(--card)', border: '2px dashed var(--border)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: 'var(--accent-fg)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-sm font-semibold">New post</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Start from scratch
            </span>
          </button>

          {posts.length === 0 ? (
            // -------- NICER EMPTY STATE --------
            <>
              <div
                className="aspect-[4/5] rounded-3xl flex flex-col items-center justify-center gap-3 col-span-2 md:col-span-3 xl:col-span-4 p-6 text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <span className="text-4xl">🎨</span>
                <p className="text-base font-semibold">Your canvas is empty</p>
                <p
                  className="text-xs max-w-md"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Save your first design and it'll show up here. Or try one of the
                  slide sets below — we'll build the whole carousel for you.
                </p>
                <button
                  onClick={() => onOpenSlideSet('editorial')}
                  className="mt-2 px-5 py-2 rounded-xl text-xs font-semibold transition active:scale-95"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                  }}
                >
                  Try a slide set →
                </button>
              </div>
            </>
          ) : (
            <>
              {posts.map((post) => {
                const firstSlide = post.slides?.[0];
                const slideCount = post.slides?.length ?? 0;
                return (
                  <button
                    key={post.id}
                    onClick={() => onOpenPost(post.id)}
                    className="aspect-[4/5] rounded-3xl overflow-hidden relative transition active:scale-95 hover:scale-[1.02]"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.previewDataUrl}
                      alt={firstSlide?.headline ?? ''}
                      className="w-full h-full object-cover"
                    />
                    {slideCount > 1 && (
                      <span
                        className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                      >
                        {slideCount} slides
                      </span>
                    )}
                  </button>
                );
              })}

              {Array.from({ length: Math.max(0, 4 - posts.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-[4/5] rounded-3xl flex items-center justify-center"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Empty
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* ---------- SLIDE SETS SHOWCASE ---------- */}
      <section className="mb-12 fade-up" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              ⭐ Slide sets
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  color: 'var(--accent-fg)',
                }}
              >
                NEW
              </span>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Auto-generate a matching carousel in one click
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SLIDE_SETS.map((s) => (
            <button
              key={s.id}
              onClick={() => onOpenSlideSet(s.id)}
              className="rounded-3xl flex flex-col items-center gap-3 cursor-pointer transition hover:scale-[1.02] active:scale-95 p-3"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
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
                width={180}
              />
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {s.emoji} {s.name}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {s.tagline}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- TEMPLATES ---------- */}
      <section className="fade-up" style={{ animationDelay: '320ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Templates</h2>
          <button
            onClick={onOpenTemplates}
            className="text-sm transition hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            See all →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          {TEMPLATES.slice(0, 5).map((t) => (
            <button
              key={t.id}
              onClick={() => onPickTemplate(t.id)}
              className="rounded-3xl flex flex-col items-center gap-3 cursor-pointer transition hover:scale-[1.02] active:scale-95 p-3"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <TemplatePreview
                templateId={t.id}
                baseConfig={DEFAULT_CONFIG}
                width={200}
              />
              <div className="text-center">
                <p className="text-sm font-semibold flex items-center justify-center gap-1.5">
                  <span>{t.emoji}</span>
                  <span>{t.name}</span>
                </p>
                <p
                  className="text-[10px] mt-1 line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.tagline}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- Quick start card ----------
function QuickCard({
  emoji,
  title,
  sub,
  onClick,
  accent,
}: {
  emoji: string;
  title: string;
  sub: string;
  onClick: () => void;
  accent?: boolean;
}) {
  if (accent) {
    return (
      <button
        onClick={onClick}
        className="relative overflow-hidden rounded-3xl p-5 text-left transition active:scale-[0.98] hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          color: 'var(--accent-fg)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative">
          <div className="text-3xl mb-3">{emoji}</div>
          <p className="text-base font-bold">{title}</p>
          <p className="text-xs mt-0.5 opacity-90">{sub}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="rounded-3xl p-5 text-left transition active:scale-[0.98] hover:scale-[1.01]"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <p className="text-base font-bold">{title}</p>
      <p
        className="text-xs mt-0.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {sub}
      </p>
    </button>
  );
}