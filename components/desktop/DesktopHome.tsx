// components/desktop/DesktopHome.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPosts, type SavedPost } from '@/lib/storage';
import { TEMPLATES, type TemplateId } from '@/lib/templates';

type Props = {
  onCreate: () => void;
  onPickTemplate: (id: TemplateId) => void;
  refreshKey?: number;
};

export default function DesktopHome({
  onCreate,
  onPickTemplate,
  refreshKey = 0,
}: Props) {
  const [posts, setPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    setPosts(getPosts().slice(0, 4));
  }, [refreshKey]);

  return (
    <div className="px-10 py-10 fade-in max-w-[1400px] mx-auto">
      <div className="mb-10">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Welcome back 👋
        </p>
        <h1 className="text-3xl font-bold mt-1">What will you create today?</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {['Home', 'Templates'].map((t, i) => (
          <button
            key={t}
            className="px-5 py-2 rounded-full text-sm font-medium transition"
            style={{
              background: i === 0 ? 'var(--card-hover)' : 'transparent',
              border: '1px solid var(--border)',
              color: i === 0 ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-10"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search your posts, templates..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text)' }}
        />
      </div>

      <div className="flex gap-4 mb-12 overflow-x-auto no-scrollbar pb-2">
        {[
          { emoji: '📸', label: 'Social' },
          { emoji: '📱', label: 'Story' },
          { emoji: '🖼️', label: 'Square' },
          { emoji: '🎨', label: 'Poster' },
          { emoji: '📰', label: 'Magazine' },
          { emoji: '💼', label: 'LinkedIn' },
          { emoji: '📺', label: 'YouTube' },
          { emoji: '✨', label: 'More' },
        ].map((c) => (
          <button
            key={c.label}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-105"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {c.emoji}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <section className="mb-12">
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
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-sm font-semibold">New post</span>
          </button>

          {posts.map((post) => {
            const firstSlide = post.slides?.[0];
            const slideCount = post.slides?.length ?? 0;
            return (
              <div
                key={post.id}
                className="aspect-[4/5] rounded-3xl overflow-hidden relative"
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
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                    }}
                  >
                    {slideCount} slides
                  </span>
                )}
              </div>
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
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Templates for you</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onPickTemplate(t.id)}
              className="aspect-[4/5] rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition hover:scale-[1.02] active:scale-95"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <span className="text-4xl">{t.emoji}</span>
              <span className="text-sm font-medium">{t.name}</span>
              <span
                className="text-[10px] px-3 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.tagline}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}