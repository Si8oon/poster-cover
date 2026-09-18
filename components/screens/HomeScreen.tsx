// components/screens/HomeScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPosts, type SavedPost } from '@/lib/storage';

type Props = {
  onNewPost: () => void;
  refreshKey?: number;
};

export default function HomeScreen({ onNewPost, refreshKey = 0 }: Props) {
  const [posts, setPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    setPosts(getPosts().slice(0, 4));
  }, [refreshKey]);

  return (
    <div className="px-5 py-6 fade-in">
      <section>
        <h2 className="text-2xl font-bold">Welcome back 👋</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Ready to create something great?
        </p>
      </section>

      <button
        onClick={onNewPost}
        className="mt-6 w-full py-5 rounded-2xl text-left px-5 relative overflow-hidden active:scale-[0.98] transition"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          color: 'var(--accent-fg)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <p className="text-xs font-medium uppercase tracking-wider opacity-80">
          Quick start
        </p>
        <p className="text-lg font-bold mt-1">Create a new post</p>
        <p className="text-xs mt-1 opacity-80">
          Upload photo → write headline → download
        </p>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-white/5" />
      </button>

      <section className="mt-8">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Recent posts
        </h3>

        {posts.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No posts yet
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--text-muted)', opacity: 0.7 }}
            >
              Tap the + button to create your first one
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((post) => {
              const firstSlide = post.slides?.[0];
              const slideCount = post.slides?.length ?? 0;
              return (
                <div
                  key={post.id}
                  className="rounded-2xl overflow-hidden relative"
                  style={{
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
                  {/* Slide count badge (only if > 1) */}
                  {slideCount > 1 && (
                    <span
                      className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
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
          </div>
        )}
      </section>
    </div>
  );
}