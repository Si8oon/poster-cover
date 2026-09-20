// lib/fonts.ts
'use client';

/**
 * Font registry — maps a display name to:
 *   - `cssVar`: the CSS variable name (for `var(--font-...)`)
 *   - `fallback`: a matching fallback font stack
 *
 * Konva's Text component needs the ACTUAL rendered font-family string.
 * next/font generates hashed names like `__Anton_5d8d1f`, so we read
 * them at runtime from a probe element.
 */

export type FontEntry = {
  id: string;
  /** Display name shown in the picker */
  name: string;
  /** CSS variable name (without `var(...)`) */
  cssVar?: string;
  /** Fallback stack used if the CSS var is unavailable */
  fallback: string;
  /** Category — helps us preview/filter */
  category: 'display' | 'serif' | 'sans' | 'mono' | 'hand';
};

export const GOOGLE_FONTS: FontEntry[] = [
  {
    id: 'anton',
    name: 'Anton',
    cssVar: '--font-anton',
    fallback: 'Impact, "Arial Black", sans-serif',
    category: 'display',
  },
  {
    id: 'bebas',
    name: 'Bebas Neue',
    cssVar: '--font-bebas',
    fallback: '"Arial Narrow", sans-serif',
    category: 'display',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    cssVar: '--font-playfair',
    fallback: 'Georgia, serif',
    category: 'serif',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    cssVar: '--font-space-grotesk',
    fallback: 'Inter, system-ui, sans-serif',
    category: 'sans',
  },
  {
    id: 'archivo-black',
    name: 'Archivo Black',
    cssVar: '--font-archivo-black',
    fallback: '"Arial Black", sans-serif',
    category: 'display',
  },
  {
    id: 'dm-serif',
    name: 'DM Serif Display',
    cssVar: '--font-dm-serif',
    fallback: 'Georgia, serif',
    category: 'serif',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    cssVar: '--font-outfit',
    fallback: 'Inter, system-ui, sans-serif',
    category: 'sans',
  },
  {
    id: 'bricolage',
    name: 'Bricolage',
    cssVar: '--font-bricolage',
    fallback: 'Inter, system-ui, sans-serif',
    category: 'display',
  },
  {
    id: 'caveat-brush',
    name: 'Caveat Brush',
    cssVar: '--font-caveat-brush',
    fallback: '"Comic Sans MS", cursive',
    category: 'hand',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    cssVar: '--font-jetbrains-mono',
    fallback: '"Courier New", monospace',
    category: 'mono',
  },
];

/** System fonts already available without any loading. */
export const SYSTEM_FONTS: FontEntry[] = [
  {
    id: 'impact',
    name: 'Impact',
    fallback: 'Impact, "Arial Black", sans-serif',
    category: 'display',
  },
  {
    id: 'georgia',
    name: 'Georgia',
    fallback: 'Georgia, serif',
    category: 'serif',
  },
  {
    id: 'trebuchet',
    name: 'Trebuchet',
    fallback: '"Trebuchet MS", sans-serif',
    category: 'sans',
  },
  {
    id: 'courier',
    name: 'Courier',
    fallback: '"Courier New", monospace',
    category: 'mono',
  },
  {
    id: 'arial-black',
    name: 'Arial Black',
    fallback: '"Arial Black", sans-serif',
    category: 'display',
  },
  {
    id: 'comic-sans',
    name: 'Comic Sans',
    fallback: '"Comic Sans MS", cursive',
    category: 'hand',
  },
  {
    id: 'verdana',
    name: 'Verdana',
    fallback: 'Verdana, sans-serif',
    category: 'sans',
  },
];

export const ALL_FONTS: FontEntry[] = [...GOOGLE_FONTS, ...SYSTEM_FONTS];

/**
 * Returns a Konva-compatible font-family string for a given font entry.
 * For Google Fonts, reads the actual generated name from CSS at runtime.
 * Falls back to the CSS variable reference if the read fails.
 */
const familyCache = new Map<string, string>();

export function resolveFontFamily(entry: FontEntry): string {
  if (!entry.cssVar) return entry.fallback;

  const cached = familyCache.get(entry.id);
  if (cached) return cached;

  if (typeof window === 'undefined') {
    // SSR — return the CSS var reference; will resolve on client
    return `var(${entry.cssVar}), ${entry.fallback}`;
  }

  // Create a probe element, apply the CSS var as font-family, read computed
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.fontFamily = `var(${entry.cssVar}), ${entry.fallback}`;
  probe.textContent = 'M';
  document.body.appendChild(probe);

  const family = getComputedStyle(probe).fontFamily;
  document.body.removeChild(probe);

  const resolved = family || entry.fallback;
  familyCache.set(entry.id, resolved);
  return resolved;
}

/** Resolve all fonts eagerly once the page mounts. */
export function warmupFonts() {
  if (typeof window === 'undefined') return;
  GOOGLE_FONTS.forEach((f) => resolveFontFamily(f));
}

/**
 * Given a font-family string (e.g. what's stored in a config), returns
 * the matching FontEntry for UI purposes. Falls back to a generic entry.
 */
export function findFontEntry(familyString: string): FontEntry {
  // Try direct match on the fallback
  const direct = ALL_FONTS.find((f) => f.fallback === familyString);
  if (direct) return direct;

  // Try matching by name substring
  const byName = ALL_FONTS.find((f) =>
    familyString.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])
  );
  if (byName) return byName;

  return SYSTEM_FONTS[0];
}

/** Build a font-family string suitable for storage in a config. */
export function fontEntryToFamily(entry: FontEntry): string {
  if (!entry.cssVar) return entry.fallback;
  // Store as: `var(--font-x), fallback` — resolvable at render time
  return `var(${entry.cssVar}), ${entry.fallback}`;
}

/**
 * Konva-safe: resolves a stored font-family string (which may contain
 * a `var(--font-x)` reference) into an actual computed font stack.
 */
export function konvaFontFamily(stored: string): string {
  if (typeof window === 'undefined') return stored;
  if (!stored.includes('var(')) return stored;

  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.fontFamily = stored;
  probe.textContent = 'M';
  document.body.appendChild(probe);

  const family = getComputedStyle(probe).fontFamily;
  document.body.removeChild(probe);

  return family || stored;
}