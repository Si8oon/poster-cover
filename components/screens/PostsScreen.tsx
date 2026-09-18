// components/screens/PostsScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPosts, deletePost, type SavedPost } from '@/lib/storage';

type Props = {
  onNewPost: () => void;
  refreshKey?: number;
};

export default function PostsScreen({ onNewPost, refreshKey = 0 }: Props) {
  const [posts, setPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    setPosts(getPosts());
  }, [refreshKey]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this post?')) return;
    deletePost(id);
    setPosts(getPosts());
  };

  if (posts.length === 0) {
    return (
      <div className="px-5 py-6 fade-in">
        <h2 className="text-2xl font-bold">My Posts</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Your saved designs will appear here
        </p>

        <div
          className="mt-6 rounded-2xl p-8 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Nothing saved yet
          </p>
          <button
            onClick={onNewPost}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-medium transition"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Create your first post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 fade-in">
      <h2 className="text-2xl font-bold">My Posts</h2>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        {posts.length} saved {posts.length === 1 ? 'post' : 'posts'}
      </p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {posts.map((post) => {
          const firstSlide = post.slides?.[0];
          const slideCount = post.slides?.length ?? 0;
          return (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden relative group"
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

              {/* Slide count badge */}
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

              <button
                onClick={() => handleDelete(post.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                title="Delete"
              >
                ✕
              </button>

              <div className="p-3">
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {firstSlide?.headline || 'Untitled'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}