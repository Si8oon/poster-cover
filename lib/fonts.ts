// lib/fonts.ts
'use client';

export type FontEntry = {
  id: string;
  name: string;
  cssVar?: string;
  fallback: string;
  category: 'display' | 'serif' | 'sans' | 'mono' | 'hand';
};

export const GOOGLE_FONTS: FontEntry[] = [
  { id: 'anton', name: 'Anton', cssVar: '--font-anton', fallback: 'Impact, "Arial Black", sans-serif', category: 'display' },
  { id: 'bebas', name: 'Bebas Neue', cssVar: '--font-bebas', fallback: '"Arial Narrow", sans-serif', category: 'display' },
  { id: 'playfair', name: 'Playfair Display', cssVar: '--font-playfair', fallback: 'Georgia, serif', category: 'serif' },
  { id: 'space-grotesk', name: 'Space Grotesk', cssVar: '--font-space-grotesk', fallback: 'Inter, system-ui, sans-serif', category: 'sans' },
  { id: 'archivo-black', name: 'Archivo Black', cssVar: '--font-archivo-black', fallback: '"Arial Black", sans-serif', category: 'display' },
  { id: 'dm-serif', name: 'DM Serif Display', cssVar: '--font-dm-serif', fallback: 'Georgia, serif', category: 'serif' },
  { id: 'outfit', name: 'Outfit', cssVar: '--font-outfit', fallback: 'Inter, system-ui, sans-serif', category: 'sans' },
  { id: 'bricolage', name: 'Bricolage', cssVar: '--font-bricolage', fallback: 'Inter, system-ui, sans-serif', category: 'display' },
  { id: 'caveat-brush', name: 'Caveat Brush', cssVar: '--font-caveat-brush', fallback: '"Comic Sans MS", cursive', category: 'hand' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', cssVar: '--font-jetbrains-mono', fallback: '"Courier New", monospace', category: 'mono' },
  { id: 'permanent-marker', name: 'Permanent Marker', cssVar: '--font-permanent-marker', fallback: '"Comic Sans MS", cursive', category: 'hand' },
  { id: 'rock-salt', name: 'Rock Salt', cssVar: '--font-rock-salt', fallback: '"Comic Sans MS", cursive', category: 'hand' },
];

export const SYSTEM_FONTS: FontEntry[] = [
  { id: 'impact', name: 'Impact', fallback: 'Impact, "Arial Black", sans-serif', category: 'display' },
  { id: 'georgia', name: 'Georgia', fallback: 'Georgia, serif', category: 'serif' },
  { id: 'trebuchet', name: 'Trebuchet', fallback: '"Trebuchet MS", sans-serif', category: 'sans' },
  { id: 'courier', name: 'Courier', fallback: '"Courier New", monospace', category: 'mono' },
  { id: 'arial-black', name: 'Arial Black', fallback: '"Arial Black", sans-serif', category: 'display' },
  { id: 'comic-sans', name: 'Comic Sans', fallback: '"Comic Sans MS", cursive', category: 'hand' },
  { id: 'verdana', name: 'Verdana', fallback: 'Verdana, sans-serif', category: 'sans' },
];

export const ALL_FONTS: FontEntry[] = [...GOOGLE_FONTS, ...SYSTEM_FONTS];

const familyCache = new Map<string, string>();

export function resolveFontFamily(entry: FontEntry): string {
  if (!entry.cssVar) return entry.fallback;
  const cached = familyCache.get(entry.id);
  if (cached) return cached;
  if (typeof window === 'undefined') return `var(${entry.cssVar}), ${entry.fallback}`;
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

export function warmupFonts() {
  if (typeof window === 'undefined') return;
  GOOGLE_FONTS.forEach((f) => resolveFontFamily(f));
}

export function findFontEntry(familyString: string): FontEntry {
  const direct = ALL_FONTS.find((f) => f.fallback === familyString);
  if (direct) return direct;
  const byName = ALL_FONTS.find((f) =>
    familyString.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])
  );
  if (byName) return byName;
  return SYSTEM_FONTS[0];
}

export function fontEntryToFamily(entry: FontEntry): string {
  if (!entry.cssVar) return entry.fallback;
  return `var(${entry.cssVar}), ${entry.fallback}`;
}

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