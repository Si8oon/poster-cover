// lib/templates.ts
import type { PostConfig, CanvasElement } from './types';

export type TemplateId =
  | 'forbes'
  | 't3ch'
  | 'quote'
  | 'yen'
  | 'terminal'
  | 'editorial'
  | 'editorialCover'
  | 'editorialOutro'
  | 'splitQuote'
  | 'splitQuoteDark'
  | 'memorial'
  | 'basquiatYellow'
  | 'basquiatRed'
  | 'basquiatBlue';

export type Template = {
  id: TemplateId;
  name: string;
  emoji: string;
  tagline: string;
  config: Partial<PostConfig>;
  elements?: CanvasElement[];
};

const nid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const TEMPLATES: Template[] = [
  {
    id: 'forbes',
    name: 'Classic Forbes',
    emoji: '📰',
    tagline: 'Bold Impact headlines with green highlights.',
    config: {
      font: 'var(--font-anton), Impact, "Arial Black", sans-serif',
      fontSize: 36,
      textColor: '#ffffff',
      highlightColor: '#00d97e',
      align: 'left',
      overlayStyle: 'solid',
      overlayOpacity: 0.45,
      paperBg: 'none',
      headline: 'YOUR BIG HEADLINE GOES HERE',
      highlightWords: ['HEADLINE'],
    },
    elements: [],
  },
  {
    id: 't3ch',
    name: 'T3CH News',
    emoji: '🎨',
    tagline: 'Red logo pill, gradient overlay, modern type.',
    config: {
      font: 'var(--font-archivo-black), "Arial Black", sans-serif',
      fontSize: 36,
      textColor: '#ffffff',
      highlightColor: '#fbbf24',
      align: 'left',
      overlayStyle: 'gradient-bottom',
      overlayOpacity: 0.85,
      paperBg: 'none',
      headline: 'YOUR BIG TECH HEADLINE GOES HERE',
      highlightWords: ['HEADLINE'],
    },
    elements: [
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: 'BRAND', bgColor: '#ef4444', textColor: '#ffffff', fontSize: 14, snap: 'top-center' },
      { id: nid(), type: 'swipeArrow', x: 0, y: 0, size: 0.07, bgColor: '#ffffff', textColor: '#000000', snap: 'middle-right' },
    ],
  },
  {
    id: 'quote',
    name: 'Quote Card',
    emoji: '❝',
    tagline: 'Elegant serif quote with circle inset.',
    config: {
      font: 'var(--font-playfair), Georgia, serif',
      fontSize: 30,
      textColor: '#ffffff',
      highlightColor: '#fbbf24',
      align: 'center',
      overlayStyle: 'gradient-bottom',
      overlayOpacity: 0.9,
      paperBg: 'none',
      headline: 'YOUR FAVORITE QUOTE GOES RIGHT HERE',
      highlightWords: ['QUOTE'],
    },
    elements: [
      { id: nid(), type: 'circleImage', x: 0, y: 0, size: 0.22, imageUrl: '', snap: 'top-right' },
    ],
  },
  {
    id: 'yen',
    name: 'YEN Trending',
    emoji: '🌍',
    tagline: 'Yellow + white text, trending pill, circle inset.',
    config: {
      font: 'var(--font-archivo-black), "Arial Black", sans-serif',
      fontSize: 30,
      textColor: '#ffffff',
      highlightColor: '#fbbf24',
      align: 'left',
      overlayStyle: 'gradient-bottom',
      overlayOpacity: 0.95,
      paperBg: 'none',
      headline: 'YOUR TRENDING STORY HEADLINE HERE',
      highlightWords: ['TRENDING'],
    },
    elements: [
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: 'TRENDING', bgColor: '#fbbf24', textColor: '#000000', fontSize: 12, snap: 'middle-center' },
      { id: nid(), type: 'circleImage', x: 0, y: 0, size: 0.22, imageUrl: '', snap: 'bottom-right' },
    ],
  },
  {
    id: 'terminal',
    name: 'Terminal',
    emoji: '🖥️',
    tagline: 'Monospace, neon green, hacker vibe.',
    config: {
      font: 'var(--font-jetbrains-mono), "Courier New", monospace',
      fontSize: 28,
      textColor: '#22ff22',
      highlightColor: '#ffffff',
      align: 'left',
      overlayStyle: 'none',
      overlayOpacity: 0,
      paperBg: 'none',
      headline: 'YOUR CODE OR COMMAND HERE',
      highlightWords: ['CODE'],
    },
    elements: [
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: '</>', bgColor: '#22c55e', textColor: '#000000', fontSize: 12, snap: 'top-left' },
    ],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    emoji: '📖',
    tagline: 'Cream paper, big number, refined serif.',
    config: {
      paperBg: 'grid',
      backgroundImage: null,
      headline: '',
      highlightWords: [],
      overlayStyle: 'none',
      overlayOpacity: 0,
      textY: 1,
      header: { enabled: true, handle: '@yourhandle', showCounter: true, showProgress: true, accentColor: '#e07a3f', textColor: '#1a1a1a' },
    },
    elements: [
      { id: nid(), type: 'headingNumber', x: 0.06, y: 0.16, number: '01', fontSize: 72, color: '#e07a3f', font: 'var(--font-playfair), Georgia, serif', italic: true, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.26, y: 0.2, text: 'Your big headline goes here', fontSize: 26, color: '#111111', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.05, bold: true, width: 0.68, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.06, y: 0.42, text: 'A short paragraph that tells the story in one or two sentences. Keep it punchy and readable.', fontSize: 12, color: '#4a4a4a', font: 'var(--font-outfit), Inter, system-ui, sans-serif', lineHeight: 1.45, width: 0.88, align: 'left', snap: 'free' },
      { id: nid(), type: 'card', x: 0.06, y: 0.66, width: 0.88, title: 'username/project-name', subtitle: 'A short description of what this thing is and why it matters.', stats: [ { icon: '★', value: '10.5k', label: 'Stars' }, { icon: '⑂', value: '2.2k', label: 'Forks' }, { icon: '◎', value: '88', label: 'Issues' } ], bgColor: '#ffffff', titleColor: '#111111', subtitleColor: '#666666', accentColor: '#fbbf24', shadow: true, snap: 'free' },
    ],
  },
  {
    id: 'editorialCover',
    name: 'Editorial Cover',
    emoji: '🎬',
    tagline: 'Magazine-cover style opener.',
    config: {
      paperBg: 'cream',
      backgroundImage: null,
      headline: '',
      highlightWords: [],
      overlayStyle: 'none',
      overlayOpacity: 0,
      textY: 0.4,
      header: { enabled: true, handle: '@yourhandle', showCounter: false, showProgress: false, accentColor: '#e07a3f', textColor: '#1a1a1a' },
    },
    elements: [
      { id: nid(), type: 'bodyText', x: 0.1, y: 0.18, text: 'TRENDING · THIS WEEK', fontSize: 11, color: '#e07a3f', font: 'var(--font-outfit), Inter, system-ui, sans-serif', lineHeight: 1.2, width: 0.8, align: 'left', snap: 'free' },
      { id: nid(), type: 'headingNumber', x: 0.1, y: 0.28, number: '5', fontSize: 130, color: '#e07a3f', font: 'var(--font-playfair), Georgia, serif', italic: true, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.3, y: 0.32, text: 'Things that happened this week', fontSize: 32, color: '#111111', font: 'var(--font-playfair), Georgia, serif', lineHeight: 1.05, bold: false, width: 0.62, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.1, y: 0.75, text: 'and which ones actually matter', fontSize: 15, color: '#4a4a4a', font: 'var(--font-playfair), Georgia, serif', lineHeight: 1.2, width: 0.8, align: 'left', snap: 'free' },
    ],
  },
  {
    id: 'editorialOutro',
    name: 'Editorial Outro',
    emoji: '🎯',
    tagline: 'Closing slide with a save prompt.',
    config: {
      paperBg: 'cream',
      backgroundImage: null,
      headline: '',
      highlightWords: [],
      overlayStyle: 'none',
      overlayOpacity: 0,
      textY: 1,
      header: { enabled: true, handle: '@yourhandle', showCounter: true, showProgress: true, accentColor: '#e07a3f', textColor: '#1a1a1a' },
    },
    elements: [
      { id: nid(), type: 'headingText', x: 0.1, y: 0.28, text: 'That’s a wrap.', fontSize: 42, color: '#111111', font: 'var(--font-playfair), Georgia, serif', lineHeight: 1.05, bold: false, width: 0.8, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.1, y: 0.5, text: 'Save this post for later and follow for more.', fontSize: 15, color: '#4a4a4a', font: 'var(--font-outfit), Inter, system-ui, sans-serif', lineHeight: 1.4, width: 0.8, align: 'left', snap: 'free' },
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: '★  SAVE FOR LATER', bgColor: '#e07a3f', textColor: '#ffffff', fontSize: 12, snap: 'bottom-center' },
    ],
  },
  {
    id: 'splitQuote',
    name: 'Split Quote ⭐',
    emoji: '🎤',
    tagline: 'Two photos up top, big quote below.',
    config: {
      backgroundImage: null,
      paperBg: 'none',
      headline: '',
      highlightWords: [],
      font: 'var(--font-anton), Impact, "Arial Black", sans-serif',
      fontSize: 32,
      textColor: '#ffffff',
      highlightColor: '#ffffff',
      align: 'left',
      uppercase: true,
      letterSpacing: 0,
      textY: 1,
      textStroke: { color: '#000000', width: 0 },
      textShadow: { color: '#000000', blur: 6, offsetX: 0, offsetY: 2 },
      overlayStyle: 'cinematic',
      overlayOpacity: 1,
    },
    elements: [
      { id: nid(), type: 'splitImage', x: 0, y: 0, width: 1, height: 0.62, leftImageUrl: '', rightImageUrl: '', splitRatio: 0.5, divider: 'none', dividerColor: '#ffffff', snap: 'free' },
      { id: nid(), type: 'quoteMark', x: 0.055, y: 0.48, char: '“', fontSize: 90, color: '#ffffff', font: 'var(--font-playfair), Georgia, serif', snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.055, y: 0.62, text: 'YOUR BIG QUOTE GOES HERE — MAKE IT COUNT.', fontSize: 26, color: '#ffffff', font: 'var(--font-space-grotesk), Inter, system-ui, sans-serif', lineHeight: 1.12, bold: true, width: 0.89, align: 'left', shadow: true, snap: 'free' },
      { id: nid(), type: 'attribution', x: 0.055, y: 0.89, text: '-YOUR NAME, SOURCE (YEAR)', fontSize: 12, color: '#ffffff', font: 'var(--font-outfit), Inter, system-ui, sans-serif', letterSpacing: 0.5, uppercase: false, bold: true, width: 0.89, align: 'left', snap: 'free' },
    ],
  },
  {
    id: 'splitQuoteDark',
    name: 'Split Quote (Clean)',
    emoji: '🎬',
    tagline: 'Same layout, cleaner look.',
    config: {
      backgroundImage: null,
      paperBg: 'none',
      headline: '',
      highlightWords: [],
      font: 'var(--font-archivo-black), "Arial Black", sans-serif',
      fontSize: 30,
      textColor: '#ffffff',
      highlightColor: '#ffffff',
      align: 'left',
      uppercase: true,
      letterSpacing: 0,
      textY: 1,
      textStroke: { color: '#000000', width: 0 },
      textShadow: { color: '#000000', blur: 6, offsetX: 0, offsetY: 2 },
      overlayStyle: 'double',
      overlayOpacity: 1,
    },
    elements: [
      { id: nid(), type: 'splitImage', x: 0, y: 0, width: 1, height: 0.58, leftImageUrl: '', rightImageUrl: '', splitRatio: 0.5, divider: 'gap', dividerColor: '#ffffff', snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.055, y: 0.6, text: 'YOUR BIG QUOTE GOES RIGHT HERE.', fontSize: 28, color: '#ffffff', font: 'var(--font-archivo-black), "Arial Black", sans-serif', lineHeight: 1.1, bold: true, width: 0.89, align: 'left', shadow: true, snap: 'free' },
      { id: nid(), type: 'attribution', x: 0.055, y: 0.9, text: '-YOUR NAME, SOURCE (YEAR)', fontSize: 12, color: '#ffffff', font: 'var(--font-outfit), Inter, system-ui, sans-serif', letterSpacing: 0.5, uppercase: false, bold: true, width: 0.89, align: 'left', snap: 'free' },
    ],
  },
  {
    id: 'memorial',
    name: 'Memorial',
    emoji: '🎂',
    tagline: 'Full photo, circle inset, tribute post.',
    config: {
      backgroundImage: null,
      paperBg: 'none',
      headline: '',
      highlightWords: [],
      font: 'var(--font-bebas), Impact, "Arial Narrow", sans-serif',
      fontSize: 30,
      textColor: '#ffffff',
      highlightColor: '#ffffff',
      align: 'center',
      uppercase: true,
      letterSpacing: 0,
      textY: 1,
      textStroke: { color: '#000000', width: 0 },
      textShadow: { color: '#000000', blur: 6, offsetX: 0, offsetY: 2 },
      overlayStyle: 'bottom-half',
      overlayOpacity: 1,
    },
    elements: [
      { id: nid(), type: 'circleImage', x: 0.06, y: 0.35, size: 0.3, imageUrl: '', snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.055, y: 0.6, text: 'HAPPY BIRTHDAY TO SOMEONE GREAT — WE MISS YOU EVERY DAY', fontSize: 24, color: '#ffffff', font: 'var(--font-bebas), Impact, "Arial Narrow", sans-serif', lineHeight: 1.12, bold: true, width: 0.89, align: 'left', shadow: true, snap: 'free' },
      { id: nid(), type: 'attribution', x: 0.055, y: 0.93, text: 'SWIPE FOR MORE', fontSize: 12, color: '#ffffff', font: 'var(--font-outfit), Inter, system-ui, sans-serif', letterSpacing: 1.5, uppercase: true, bold: true, width: 0.89, align: 'center', snap: 'free' },
    ],
  },

  // =========================================================
  //  BASQUIAT SET
  // =========================================================

  {
    id: 'basquiatYellow',
    name: 'Neo Yellow',
    emoji: '👑',
    tagline: 'Yellow crown, black scrawl, raw canvas.',
    config: {
      backgroundImage: null,
      paperBg: 'cream',
      headline: '',
      highlightWords: [],
      font: 'var(--font-permanent-marker), "Comic Sans MS", cursive',
      fontSize: 28,
      textColor: '#111111',
      highlightColor: '#dc2626',
      align: 'left',
      uppercase: false,
      letterSpacing: 0,
      textY: 1,
      textStroke: { color: '#000000', width: 0 },
      textShadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
      overlayStyle: 'none',
      overlayOpacity: 0,
      header: { enabled: false, handle: '@yourhandle', showCounter: false, showProgress: false, accentColor: '#fbbf24', textColor: '#111111' },
    },
    elements: [
      { id: nid(), type: 'crown', x: 0.05, y: 0.06, size: 0.22, color: '#fbbf24', strokeColor: '#111111', strokeWidth: 4, style: 'solid', snap: 'free' },
      { id: nid(), type: 'tag', x: 0.68, y: 0.08, text: '© 2026', fontSize: 14, color: '#111111', font: 'var(--font-rock-salt), cursive', rotation: -3, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.06, y: 0.32, text: 'MAKE IT LOUD.', fontSize: 44, color: '#111111', font: 'var(--font-permanent-marker), "Comic Sans MS", cursive', lineHeight: 1.05, bold: false, width: 0.88, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'crossout', x: 0.15, y: 0.42, width: 0.55, height: 5, color: '#dc2626', rotation: -2, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.06, y: 0.48, text: 'THEN MAKE IT LOUDER.', fontSize: 36, color: '#111111', font: 'var(--font-permanent-marker), "Comic Sans MS", cursive', lineHeight: 1.05, bold: false, width: 0.88, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.06, y: 0.68, text: 'Not for sale. Not for critics. Just for the people who get it.', fontSize: 14, color: '#1a1a1a', font: 'var(--font-caveat-brush), cursive', lineHeight: 1.3, width: 0.88, align: 'left', snap: 'free' },
      { id: nid(), type: 'tag', x: 0.06, y: 0.9, text: '5¢', fontSize: 16, color: '#dc2626', font: 'var(--font-rock-salt), cursive', rotation: 2, snap: 'free' },
      { id: nid(), type: 'crown', x: 0.78, y: 0.86, size: 0.12, color: 'transparent', strokeColor: '#111111', strokeWidth: 3, style: 'outline', snap: 'free' },
    ],
  },

  {
    id: 'basquiatRed',
    name: 'Neo Red',
    emoji: '✏️',
    tagline: 'Red anger, crossed-out words, raw.',
    config: {
      backgroundImage: null,
      paperBg: 'cream',
      headline: '',
      highlightWords: [],
      font: 'var(--font-rock-salt), cursive',
      fontSize: 26,
      textColor: '#111111',
      highlightColor: '#dc2626',
      align: 'left',
      uppercase: false,
      letterSpacing: 0,
      textY: 1,
      textStroke: { color: '#000000', width: 0 },
      textShadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
      overlayStyle: 'none',
      overlayOpacity: 0,
      header: { enabled: false, handle: '@yourhandle', showCounter: false, showProgress: false, accentColor: '#dc2626', textColor: '#111111' },
    },
    elements: [
      { id: nid(), type: 'crown', x: 0.55, y: 0.06, size: 0.28, color: 'transparent', strokeColor: '#dc2626', strokeWidth: 5, style: 'outline', snap: 'free' },
      { id: nid(), type: 'tag', x: 0.06, y: 0.08, text: 'listen,', fontSize: 18, color: '#111111', font: 'var(--font-rock-salt), cursive', rotation: -4, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.06, y: 0.22, text: 'BE NICE', fontSize: 40, color: '#111111', font: 'var(--font-rock-salt), cursive', lineHeight: 1.05, bold: false, width: 0.88, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'crossout', x: 0.06, y: 0.28, width: 0.4, height: 6, color: '#dc2626', rotation: -3, snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.06, y: 0.4, text: 'MAKE NOISE.', fontSize: 48, color: '#dc2626', font: 'var(--font-permanent-marker), "Comic Sans MS", cursive', lineHeight: 1.02, bold: false, width: 0.88, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'bodyText', x: 0.06, y: 0.62, text: 'Nobody remembers the people who stayed quiet.', fontSize: 15, color: '#1a1a1a', font: 'var(--font-caveat-brush), cursive', lineHeight: 1.3, width: 0.88, align: 'left', snap: 'free' },
      { id: nid(), type: 'tag', x: 0.06, y: 0.9, text: '© 2026 · NOT FOR SALE', fontSize: 11, color: '#111111', font: 'var(--font-rock-salt), cursive', rotation: -1, snap: 'free' },
      { id: nid(), type: 'crown', x: 0.82, y: 0.86, size: 0.1, color: '#fbbf24', strokeColor: '#111111', strokeWidth: 3, style: 'solid', snap: 'free' },
    ],
  },

  {
    id: 'basquiatBlue',
    name: 'Neo Blue',
    emoji: '🌊',
    tagline: 'Blue reflection, calm scrawl, thinker energy.',
    config: {
      backgroundImage: null,
      paperBg: 'cream',
      headline: '',
      highlightWords: [],
      font: 'var(--font-caveat-brush), cursive',
      fontSize: 28,
      textColor: '#111111',
      highlightColor: '#1d4ed8',
      align: 'left',
      uppercase: false,
      letterSpacing: 0,
      textY: 1,
      textStroke: { color: '#000000', width: 0 },
      textShadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
      overlayStyle: 'none',
      overlayOpacity: 0,
      header: { enabled: false, handle: '@yourhandle', showCounter: false, showProgress: false, accentColor: '#1d4ed8', textColor: '#111111' },
    },
    elements: [
      { id: nid(), type: 'crown', x: 0.06, y: 0.08, size: 0.18, color: '#1d4ed8', strokeColor: '#111111', strokeWidth: 3, style: 'solid', snap: 'free' },
      { id: nid(), type: 'tag', x: 0.7, y: 0.1, text: '03.20.26', fontSize: 12, color: '#1d4ed8', font: 'var(--font-rock-salt), cursive', rotation: 2, snap: 'free' },
      { id: nid(), type: 'quoteMark', x: 0.06, y: 0.24, char: '“', fontSize: 90, color: '#1d4ed8', font: 'var(--font-playfair), Georgia, serif', snap: 'free' },
      { id: nid(), type: 'headingText', x: 0.06, y: 0.42, text: 'I DON’T LISTEN TO WHAT ART CRITICS SAY.', fontSize: 26, color: '#111111', font: 'var(--font-caveat-brush), cursive', lineHeight: 1.15, bold: false, width: 0.88, align: 'left', shadow: false, snap: 'free' },
      { id: nid(), type: 'attribution', x: 0.06, y: 0.72, text: '— just look at what I see.', fontSize: 15, color: '#1d4ed8', font: 'var(--font-caveat-brush), cursive', letterSpacing: 0.5, uppercase: false, bold: false, width: 0.88, align: 'left', snap: 'free' },
      { id: nid(), type: 'tag', x: 0.78, y: 0.9, text: '© sameness', fontSize: 11, color: '#111111', font: 'var(--font-rock-salt), cursive', rotation: -2, snap: 'free' },
      { id: nid(), type: 'crown', x: 0.5, y: 0.88, size: 0.08, color: 'transparent', strokeColor: '#1d4ed8', strokeWidth: 3, style: 'outline', snap: 'free' },
    ],
  },
];

export function getTemplate(id: TemplateId): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}