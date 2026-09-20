// lib/slideSets.ts
import type { PostConfig, SlideTheme } from './types';
import { DEFAULT_CONFIG, extractTheme, applyTheme, DEFAULT_MOTION } from './types';

export type SlideSetId = 'editorial' | 'boldNews' | 'minimal' | 'magazine';

export type SlideSetDef = {
  id: SlideSetId;
  name: string;
  emoji: string;
  tagline: string;
  theme: SlideTheme;
  generate: (count: number) => PostConfig[];
};

const nid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// ---------------- EDITORIAL ----------------

const editorialTheme: SlideTheme = {
  font: 'var(--font-playfair), Georgia, serif',
  fontSize: 26,
  textColor: '#111111',
  highlightColor: '#e07a3f',
  align: 'left',
  paperBg: 'grid',
  header: {
    enabled: true,
    handle: '@yourhandle',
    showCounter: true,
    showProgress: true,
    accentColor: '#e07a3f',
    textColor: '#1a1a1a',
  },
  overlayStyle: 'none',
  overlayOpacity: 0,
  textStroke: { color: '#000000', width: 0 },
  textShadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  letterSpacing: 0,
  uppercase: false,
  motion: { ...DEFAULT_MOTION },
};

function editorialCover(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, editorialTheme),
    headline: '',
    highlightWord: '',
    textY: 0.4,
    elements: [
      { id: nid(), type: 'bodyText', x: 0.08, y: 0.16, text: 'FEATURED · THIS WEEK', fontSize: 10, color: '#e07a3f', font: 'var(--font-outfit), Inter, system-ui, sans-serif', lineHeight: 1.2, width: 0.84, align: 'left', snap: 'free' },
      { id: nid(), type: 'headingNumber', x: 0.08, y: 0.28, number: '5', fontSize: 130, color: '#e07a3f', font: 'var(--font-playfair), Georgia, serif', italic: true, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.32, y: 0.34, text: 'Things that matter this week', fontSize: 28, color: '#111111', font: 'var(--font-playfair), Georgia, serif', lineHeight: 1.05, bold: false, width: 0.6, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.08, y: 0.76, text: 'and why they matter', fontSize: 14, color: '#4a4a4a', font: 'var(--font-playfair), Georgia, serif', lineHeight: 1.2, width: 0.84, align: 'left', snap: 'free' },
    ],
  };
}

function editorialContent(index: number): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, editorialTheme),
    headline: '',
    highlightWord: '',
    elements: [
      { id: nid(), type: 'headingNumber', x: 0.06, y: 0.14, number: String(index).padStart(2, '0'), fontSize: 68, color: '#e07a3f', font: 'var(--font-playfair), Georgia, serif', italic: true, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.26, y: 0.18, text: 'Your headline goes here', fontSize: 24, color: '#111111', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.05, bold: true, width: 0.68, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.06, y: 0.42, text: 'A short paragraph that tells the story in one or two sentences. Keep it punchy and readable.', fontSize: 11, color: '#4a4a4a', font: 'var(--font-outfit), Inter, system-ui, sans-serif', lineHeight: 1.45, width: 0.88, align: 'left', snap: 'free' },
      { id: nid(), type: 'card', x: 0.06, y: 0.66, width: 0.88, title: 'username/project-name', subtitle: 'A short description of what this thing is and why it matters.', stats: [ { icon: '★', value: '10.5k', label: 'Stars' }, { icon: '⑂', value: '2.2k', label: 'Forks' }, { icon: '◎', value: '88', label: 'Issues' } ], bgColor: '#ffffff', titleColor: '#111111', subtitleColor: '#666666', accentColor: '#fbbf24', shadow: true, snap: 'free' },
    ],
  };
}

function editorialOutro(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, editorialTheme),
    headline: '',
    highlightWord: '',
    textY: 1,
    elements: [
      { id: nid(), type: 'headingText', x: 0.1, y: 0.3, text: 'That’s a wrap.', fontSize: 42, color: '#111111', font: 'var(--font-playfair), Georgia, serif', lineHeight: 1.05, bold: false, width: 0.8, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.1, y: 0.54, text: 'Save this post for later and follow for more weekly drops.', fontSize: 14, color: '#4a4a4a', font: 'var(--font-outfit), Inter, system-ui, sans-serif', lineHeight: 1.4, width: 0.8, align: 'left', snap: 'free' },
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: '★ SAVE FOR LATER', bgColor: '#e07a3f', textColor: '#ffffff', fontSize: 11, snap: 'bottom-center' },
    ],
  };
}

// ---------------- BOLD NEWS ----------------

const boldNewsTheme: SlideTheme = {
  font: 'var(--font-anton), Impact, "Arial Black", sans-serif',
  fontSize: 34,
  textColor: '#ffffff',
  highlightColor: '#fbbf24',
  align: 'left',
  paperBg: 'none',
  header: {
    enabled: false,
    handle: '@yourhandle',
    showCounter: true,
    showProgress: true,
    accentColor: '#ef4444',
    textColor: '#ffffff',
  },
  overlayStyle: 'cinematic',
  overlayOpacity: 1,
  textStroke: { color: '#000000', width: 0 },
  textShadow: { color: '#000000', blur: 6, offsetX: 0, offsetY: 2 },
  letterSpacing: 0,
  uppercase: true,
  motion: { ...DEFAULT_MOTION },
};

function boldNewsCover(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, boldNewsTheme),
    backgroundImage: null,
    headline: 'THE STORY EVERYONE IS TALKING ABOUT',
    highlightWord: 'TALKING',
    elements: [
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: 'BRAND', bgColor: '#ef4444', textColor: '#ffffff', fontSize: 13, snap: 'top-center' },
    ],
  };
}

function boldNewsContent(index: number): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, boldNewsTheme),
    headline: '',
    highlightWord: '',
    elements: [
      { id: nid(), type: 'headingNumber', x: 0.06, y: 0.08, number: String(index).padStart(2, '0'), fontSize: 60, color: '#fbbf24', font: 'var(--font-playfair), Georgia, serif', italic: false, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.06, y: 0.62, text: 'YOUR BIG HEADLINE GOES RIGHT HERE', fontSize: 26, color: '#ffffff', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.1, bold: true, width: 0.88, align: 'left', shadow: true, snap: 'free' },
      { id: nid(), type: 'swipeArrow', x: 0, y: 0, size: 0.08, bgColor: '#ffffff', textColor: '#000000', snap: 'middle-right' },
    ],
  };
}

function boldNewsOutro(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, boldNewsTheme),
    headline: 'FOLLOW FOR MORE',
    highlightWord: 'MORE',
    textY: 0.5,
    elements: [],
  };
}

// ---------------- MINIMAL ----------------

const minimalTheme: SlideTheme = {
  font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif',
  fontSize: 22,
  textColor: '#111111',
  highlightColor: '#6b7280',
  align: 'left',
  paperBg: 'cream',
  header: {
    enabled: true,
    handle: '@yourhandle',
    showCounter: true,
    showProgress: false,
    accentColor: '#111111',
    textColor: '#111111',
  },
  overlayStyle: 'none',
  overlayOpacity: 0,
  textStroke: { color: '#000000', width: 0 },
  textShadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  letterSpacing: 0,
  uppercase: false,
  motion: { ...DEFAULT_MOTION },
};

function minimalCover(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, minimalTheme),
    headline: '',
    highlightWord: '',
    textY: 0.5,
    elements: [
      { id: nid(), type: 'headingText', x: 0.1, y: 0.34, text: 'A quiet idea worth sharing.', fontSize: 30, color: '#111111', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.15, bold: false, width: 0.8, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.1, y: 0.68, text: 'A short subtitle that hints at what comes next.', fontSize: 13, color: '#4a4a4a', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.4, width: 0.8, align: 'left', snap: 'free' },
    ],
  };
}

function minimalContent(index: number): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, minimalTheme),
    headline: '',
    highlightWord: '',
    elements: [
      { id: nid(), type: 'headingNumber', x: 0.1, y: 0.18, number: String(index).padStart(2, '0'), fontSize: 50, color: '#111111', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', italic: false, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.1, y: 0.36, text: 'Your idea goes here', fontSize: 24, color: '#111111', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.2, bold: true, width: 0.8, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.1, y: 0.56, text: 'A short paragraph that expands on your idea in a couple of sentences.', fontSize: 13, color: '#4a4a4a', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.5, width: 0.8, align: 'left', snap: 'free' },
    ],
  };
}

function minimalOutro(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, minimalTheme),
    headline: '',
    highlightWord: '',
    textY: 0.5,
    elements: [
      { id: nid(), type: 'headingText', x: 0.1, y: 0.36, text: 'Thanks for reading.', fontSize: 26, color: '#111111', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.2, bold: false, width: 0.8, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.1, y: 0.6, text: 'Save this for later — and follow for more.', fontSize: 13, color: '#4a4a4a', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.4, width: 0.8, align: 'left', snap: 'free' },
    ],
  };
}

// ---------------- MAGAZINE ----------------

const magazineTheme: SlideTheme = {
  font: 'var(--font-dm-serif), Georgia, serif',
  fontSize: 28,
  textColor: '#1a1a1a',
  highlightColor: '#dc2626',
  align: 'left',
  paperBg: 'cream',
  header: {
    enabled: true,
    handle: '@yourhandle',
    showCounter: true,
    showProgress: true,
    accentColor: '#dc2626',
    textColor: '#1a1a1a',
  },
  overlayStyle: 'none',
  overlayOpacity: 0,
  textStroke: { color: '#000000', width: 0 },
  textShadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  letterSpacing: 0,
  uppercase: false,
  motion: { ...DEFAULT_MOTION },
};

function magazineCover(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, magazineTheme),
    headline: '',
    highlightWord: '',
    textY: 0.6,
    elements: [
      { id: nid(), type: 'bodyText', x: 0.08, y: 0.12, text: 'ISSUE 01 · 2026', fontSize: 10, color: '#dc2626', font: 'var(--font-outfit), Inter, system-ui, sans-serif', lineHeight: 1.2, width: 0.84, align: 'left', snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.08, y: 0.22, text: 'The stories we didn\u2019t see coming.', fontSize: 34, color: '#111111', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.05, bold: false, width: 0.84, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.08, y: 0.68, text: 'A weekly digest of the moments shaping this year.', fontSize: 13, color: '#4a4a4a', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.4, width: 0.84, align: 'left', snap: 'free' },
    ],
  };
}

function magazineContent(index: number): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, magazineTheme),
    headline: '',
    highlightWord: '',
    elements: [
      { id: nid(), type: 'headingNumber', x: 0.08, y: 0.14, number: String(index).padStart(2, '0'), fontSize: 56, color: '#dc2626', font: 'var(--font-dm-serif), Georgia, serif', italic: true, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.08, y: 0.34, text: 'A story worth telling', fontSize: 26, color: '#111111', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.1, bold: false, width: 0.84, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.08, y: 0.56, text: 'The details that matter — told in a way you\u2019ll actually remember.', fontSize: 13, color: '#4a4a4a', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.5, width: 0.84, align: 'left', snap: 'free' },
    ],
  };
}

function magazineOutro(): PostConfig {
  return {
    ...applyTheme({ ...DEFAULT_CONFIG, linkedTheme: true }, magazineTheme),
    headline: '',
    highlightWord: '',
    textY: 0.5,
    elements: [
      { id: nid(), type: 'headingText', x: 0.08, y: 0.36, text: 'Until next issue.', fontSize: 32, color: '#111111', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.1, bold: false, width: 0.84, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.08, y: 0.56, text: 'Save this post, follow along, and stay curious.', fontSize: 13, color: '#4a4a4a', font: 'var(--font-dm-serif), Georgia, serif', lineHeight: 1.4, width: 0.84, align: 'left', snap: 'free' },
    ],
  };
}

// ---------------- Registry ----------------

export const SLIDE_SETS: SlideSetDef[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    emoji: '📖',
    tagline: 'Cream paper, big numbers, serif accents',
    theme: editorialTheme,
    generate: (count) => {
      const middleCount = Math.max(1, count - 2);
      const slides = [editorialCover()];
      for (let i = 1; i <= middleCount; i++) slides.push(editorialContent(i));
      slides.push(editorialOutro());
      return slides;
    },
  },
  {
    id: 'boldNews',
    name: 'Bold News',
    emoji: '📰',
    tagline: 'Dark, cinematic, high impact',
    theme: boldNewsTheme,
    generate: (count) => {
      const middleCount = Math.max(1, count - 2);
      const slides = [boldNewsCover()];
      for (let i = 1; i <= middleCount; i++) slides.push(boldNewsContent(i));
      slides.push(boldNewsOutro());
      return slides;
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '🤍',
    tagline: 'Clean, quiet, timeless',
    theme: minimalTheme,
    generate: (count) => {
      const middleCount = Math.max(1, count - 2);
      const slides = [minimalCover()];
      for (let i = 1; i <= middleCount; i++) slides.push(minimalContent(i));
      slides.push(minimalOutro());
      return slides;
    },
  },
  {
    id: 'magazine',
    name: 'Magazine',
    emoji: '📚',
    tagline: 'Editorial spreads, warm colors',
    theme: magazineTheme,
    generate: (count) => {
      const middleCount = Math.max(1, count - 2);
      const slides = [magazineCover()];
      for (let i = 1; i <= middleCount; i++) slides.push(magazineContent(i));
      slides.push(magazineOutro());
      return slides;
    },
  },
];

export function getSlideSet(id: SlideSetId): SlideSetDef | undefined {
  return SLIDE_SETS.find((s) => s.id === id);
}