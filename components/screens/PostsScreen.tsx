// components/screens/PostsScreen.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { getPosts, deletePost, duplicatePost, type SavedPost } from '@/lib/storage';

type Props = {
  onNewPost: () => void;
  onOpenPost: (id: string) => void;
  refreshKey?: number;
};

export default function PostsScreen({ onNewPost, onOpenPost, refreshKey = 0 }: Props) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    setPosts(getPosts());
  }, [refreshKey]);

  // Close menu on outside click
  useEffect(() => {
    const close = () => setMenuOpenId(null);
    if (menuOpenId) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [menuOpenId]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    deletePost(id);
    setPosts(getPosts());
    setMenuOpenId(null);
  };

  const handleDuplicate = (id: string) => {
    duplicatePost(id);
    setPosts(getPosts());
    setMenuOpenId(null);
  };

  const startLongPress = (id: string) => {
    longPressTimer.current = window.setTimeout(() => {
      setMenuOpenId(id);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
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
          <p className="text-4xl mb-3">🎨</p>
          <p className="text-sm font-semibold">Nothing saved yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Tap + or pick a template to get started
          </p>
          <button
            onClick={onNewPost}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-medium transition active:scale-95"
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
        {posts.length} saved {posts.length === 1 ? 'post' : 'posts'} · tap to edit
      </p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {posts.map((post) => {
          const firstSlide = post.slides?.[0];
          const slideCount = post.slides?.length ?? 0;
          const isMenuOpen = menuOpenId === post.id;

          return (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden relative group fade-up"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            >
              {/* Main tap target — opens editor */}
              <button
                onClick={() => onOpenPost(post.id)}
                onMouseDown={() => startLongPress(post.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(post.id)}
                onTouchEnd={cancelLongPress}
                className="w-full text-left transition active:scale-[0.98]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.previewDataUrl}
                  alt={firstSlide?.headline ?? ''}
                  className="w-full aspect-[4/5] object-cover pointer-events-none"
                />
              </button>

              {/* Slide count badge */}
              {slideCount > 1 && (
                <span
                  className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  {slideCount}
                </span>
              )}

              {/* Menu trigger (always visible on mobile, on hover on desktop) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(isMenuOpen ? null : post.id);
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs bg-black/60 text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition"
                title="More options"
              >
                ⋯
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-11 right-2 z-20 rounded-xl overflow-hidden shadow-xl fade-in"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    minWidth: 120,
                  }}
                >
                  <button
                    onClick={() => {
                      setMenuOpenId(null);
                      onOpenPost(post.id);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    style={{ color: 'var(--text)' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(post.id)}
                    className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    style={{ color: 'var(--text)' }}
                  >
                    ⧉ Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-red-50 transition"
                    style={{ color: '#ef4444' }}
                  >
                    🗑 Delete
                  </button>
                </div>
              )}

              {/* Caption */}
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