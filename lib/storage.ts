// lib/storage.ts
'use client';

import {
  type SavedPost,
  type LegacySavedPost,
  isLegacyPost,
  migrateLegacyPost,
  normalizeConfig,
  extractTheme,
} from './types';

const STORAGE_KEY = 'postgen:posts';
const SCHEMA_VERSION_KEY = 'postgen:schema-version';

const CURRENT_SCHEMA = 4;

export type { SavedPost };

function ensureSchemaUpToDate() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(SCHEMA_VERSION_KEY);
  const storedVersion = stored ? parseInt(stored, 10) : 0;
  if (storedVersion === CURRENT_SCHEMA) return;
  localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA));
}

export function getPosts(): SavedPost[] {
  if (typeof window === 'undefined') return [];
  ensureSchemaUpToDate();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as (SavedPost | LegacySavedPost)[];
    const migrated: SavedPost[] = [];

    for (const p of parsed) {
      if (isLegacyPost(p)) {
        migrated.push(migrateLegacyPost(p));
      } else {
        const slides = (p.slides ?? []).map((s) => normalizeConfig(s));
        const theme = p.theme ?? (slides[0] ? extractTheme(slides[0]) : undefined);
        migrated.push({
          ...p,
          slides,
          theme,
        });
      }
    }

    const needsRewrite =
      parsed.some((p) => isLegacyPost(p)) ||
      JSON.stringify(parsed) !== JSON.stringify(migrated);

    if (needsRewrite) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }

    return migrated;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function getPost(id: string): SavedPost | null {
  return getPosts().find((p) => p.id === id) ?? null;
}

export function savePost(post: SavedPost) {
  const all = getPosts();
  all.unshift(post);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function updatePost(post: SavedPost) {
  const all = getPosts().map((p) => (p.id === post.id ? post : p));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function duplicatePost(id: string): SavedPost | null {
  const original = getPost(id);
  if (!original) return null;
  const copy: SavedPost = {
    ...JSON.parse(JSON.stringify(original)),
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const all = getPosts();
  all.unshift(copy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return copy;
}

export function deletePost(id: string) {
  const all = getPosts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// ---------- Reset helpers ----------

export function clearPosts() {
  localStorage.removeItem(STORAGE_KEY);
}

export function clearWelcomeFlag() {
  localStorage.removeItem('postgen:welcome-done');
  localStorage.removeItem('postgen:welcome-done:v2');
  localStorage.removeItem('postgen:welcome-done:v3');
}

export function clearDesktopNavFlag() {
  localStorage.removeItem('postgen:desktop-nav-seen:v1');
}

export function resetEverything() {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('postgen:')) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function getStorageSummary() {
  return {
    posts: getPosts().length,
    welcomeDone:
      typeof window !== 'undefined'
        ? !!localStorage.getItem('postgen:welcome-done:v2')
        : false,
    navSeen:
      typeof window !== 'undefined'
        ? !!localStorage.getItem('postgen:desktop-nav-seen:v1')
        : false,
    theme:
      typeof window !== 'undefined'
        ? localStorage.getItem('postgen:theme') ?? 'default'
        : 'default',
  };
}