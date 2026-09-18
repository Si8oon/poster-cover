// lib/storage.ts
'use client';

import {
  type SavedPost,
  type LegacySavedPost,
  isLegacyPost,
  migrateLegacyPost,
  normalizeConfig,
} from './types';

const STORAGE_KEY = 'postgen:posts';
const SCHEMA_VERSION_KEY = 'postgen:schema-version';

/** Bump this whenever PostConfig gets new required fields. */
const CURRENT_SCHEMA = 3;

export type { SavedPost };

// ---------- Schema migration ----------

function ensureSchemaUpToDate() {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(SCHEMA_VERSION_KEY);
  const storedVersion = stored ? parseInt(stored, 10) : 0;

  if (storedVersion === CURRENT_SCHEMA) return;

  // Schema changed since last visit. Existing posts will be
  // auto-normalized on read (see getPosts below), so we only
  // need to bump the version marker.
  localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA));
}

// ---------- Posts ----------

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
        migrated.push({
          ...p,
          slides: (p.slides ?? []).map((s) => normalizeConfig(s)),
        });
      }
    }

    // Rewrite storage if anything changed (migration is idempotent)
    const needsRewrite =
      parsed.some((p) => isLegacyPost(p)) ||
      JSON.stringify(parsed) !== JSON.stringify(migrated);

    if (needsRewrite) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }

    return migrated;
  } catch {
    // Corrupted storage — reset silently to prevent crashes
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
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

export function deletePost(id: string) {
  const all = getPosts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// ---------- Reset helpers (safe to call from UI) ----------

export function clearPosts() {
  localStorage.removeItem(STORAGE_KEY);
}

export function clearWelcomeFlag() {
  // Covers both v1 and v2 keys just in case
  localStorage.removeItem('postgen:welcome-done');
  localStorage.removeItem('postgen:welcome-done:v2');
  localStorage.removeItem('postgen:welcome-done:v3');
}

export function clearDesktopNavFlag() {
  localStorage.removeItem('postgen:desktop-nav-seen:v1');
}

export function resetEverything() {
  if (typeof window === 'undefined') return;
  // Only clear postgen keys — don't nuke other apps' data
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('postgen:')) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

/** Returns a friendly summary of current local data. */
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