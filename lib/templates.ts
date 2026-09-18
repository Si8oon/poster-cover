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
  | 'editorialOutro';

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
  // ---------- Classic (existing) ----------
  {
    id: 'forbes',
    name: 'Classic Forbes',
    emoji: '📰',
    tagline: 'Impact font, green highlight, dark overlay.',
    config: {
      font: 'Impact, "Arial Black", sans-serif',
      fontSize: 36,
      textColor: '#ffffff',
      highlightColor: '#00d97e',
      align: 'left',
      overlayStyle: 'solid',
      overlayOpacity: 0.45,
      paperBg: 'none',
      header: {
        enabled: false,
        handle: '@yourhandle',
        showCounter: true,
        showProgress: true,
        accentColor: '#00d97e',
        textColor: '#1a1a1a',
      },
    },
    elements: [],
  },
  {
    id: 't3ch',
    name: 'T3CH News',
    emoji: '🎨',
    tagline: 'Red logo pill, gradient overlay, colored headline.',
    config: {
      font: 'Impact, "Arial Black", sans-serif',
      fontSize: 38,
      textColor: '#ffffff',
      highlightColor: '#fbbf24',
      align: 'left',
      overlayStyle: 'gradient-bottom',
      overlayOpacity: 0.85,
      paperBg: 'none',
    },
    elements: [
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: 'T3CH', bgColor: '#ef4444', textColor: '#ffffff', fontSize: 14, snap: 'top-center' },
      { id: nid(), type: 'swipeArrow', x: 0, y: 0, size: 0.07, bgColor: '#ffffff', textColor: '#000000', snap: 'middle-right' },
    ],
  },
  {
    id: 'quote',
    name: 'Quote Card',
    emoji: '❝',
    tagline: 'Big quote, circle inset, gold accents.',
    config: {
      font: 'Georgia, serif',
      fontSize: 30,
      textColor: '#ffffff',
      highlightColor: '#fbbf24',
      align: 'center',
      overlayStyle: 'gradient-bottom',
      overlayOpacity: 0.9,
      paperBg: 'none',
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
      font: 'Impact, "Arial Black", sans-serif',
      fontSize: 32,
      textColor: '#ffffff',
      highlightColor: '#fbbf24',
      align: 'left',
      overlayStyle: 'gradient-bottom',
      overlayOpacity: 0.95,
      paperBg: 'none',
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
    tagline: 'Monospace, neon green, no overlay.',
    config: {
      font: '"Courier New", monospace',
      fontSize: 30,
      textColor: '#22ff22',
      highlightColor: '#ffffff',
      align: 'left',
      overlayStyle: 'none',
      overlayOpacity: 0,
      paperBg: 'none',
    },
    elements: [
      { id: nid(), type: 'logoPill', x: 0, y: 0, text: '< / >', bgColor: '#22c55e', textColor: '#000000', fontSize: 12, snap: 'top-left' },
    ],
  },

  // ---------- NEW: Editorial set ----------
  {
    id: 'editorial',
    name: 'Editorial',
    emoji: '📖',
    tagline: 'Cream paper, big number, card stats.',
    config: {
      paperBg: 'grid',
      backgroundImage: null,
      headline: '',
      highlightWord: '',
      overlayStyle: 'none',
      overlayOpacity: 0,
      textY: 1,
      header: {
        enabled: true,
        handle: '@yourhandle',
        showCounter: true,
        showProgress: true,
        accentColor: '#e07a3f',
        textColor: '#1a1a1a',
      },
    },
    elements: [
      {
        id: nid(),
        type: 'headingNumber',
        x: 0.06,
        y: 0.16,
        number: '01',
        fontSize: 72,
        color: '#e07a3f',
        font: 'Georgia, serif',
        italic: true,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'headingText',
        x: 0.26,
        y: 0.2,
        text: 'Your big headline goes here',
        fontSize: 26,
        color: '#111111',
        font: 'Inter, system-ui, sans-serif',
        lineHeight: 1.05,
        bold: true,
        width: 0.68,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'bodyText',
        x: 0.06,
        y: 0.42,
        text: 'A short paragraph that tells the story in one or two sentences. Keep it punchy and readable.',
        fontSize: 12,
        color: '#4a4a4a',
        font: 'Inter, system-ui, sans-serif',
        lineHeight: 1.45,
        width: 0.88,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'card',
        x: 0.06,
        y: 0.66,
        width: 0.88,
        title: 'username/repo-name',
        subtitle: 'A short description of what this thing is and why it matters.',
        stats: [
          { icon: '★', value: '10.5k', label: 'Stars' },
          { icon: '⑂', value: '2.2k', label: 'Forks' },
          { icon: '◎', value: '88', label: 'Issues' },
        ],
        bgColor: '#ffffff',
        titleColor: '#111111',
        subtitleColor: '#666666',
        accentColor: '#fbbf24',
        shadow: true,
        snap: 'free',
      },
    ],
  },
  {
    id: 'editorialCover',
    name: 'Editorial Cover',
    emoji: '🎬',
    tagline: 'Centered title — perfect for slide 1.',
    config: {
      paperBg: 'cream',
      backgroundImage: null,
      headline: '',
      highlightWord: '',
      overlayStyle: 'none',
      overlayOpacity: 0,
      textY: 0.4,
      header: {
        enabled: true,
        handle: '@yourhandle',
        showCounter: false,
        showProgress: false,
        accentColor: '#e07a3f',
        textColor: '#1a1a1a',
      },
    },
    elements: [
      {
        id: nid(),
        type: 'bodyText',
        x: 0.1,
        y: 0.18,
        text: 'TRENDING · WEEK OF AUG 28',
        fontSize: 11,
        color: '#e07a3f',
        font: 'Inter, system-ui, sans-serif',
        lineHeight: 1.2,
        width: 0.8,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'headingNumber',
        x: 0.1,
        y: 0.28,
        number: '5',
        fontSize: 130,
        color: '#e07a3f',
        font: 'Georgia, serif',
        italic: true,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'headingText',
        x: 0.3,
        y: 0.32,
        text: 'GitHub repos that cooked this week',
        fontSize: 32,
        color: '#111111',
        font: 'Georgia, serif',
        lineHeight: 1.05,
        bold: false,
        width: 0.62,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'bodyText',
        x: 0.1,
        y: 0.75,
        text: 'and which ones I would use',
        fontSize: 15,
        color: '#4a4a4a',
        font: 'Georgia, serif',
        lineHeight: 1.2,
        width: 0.8,
        snap: 'free',
      },
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
      highlightWord: '',
      overlayStyle: 'none',
      overlayOpacity: 0,
      textY: 1,
      header: {
        enabled: true,
        handle: '@yourhandle',
        showCounter: true,
        showProgress: true,
        accentColor: '#e07a3f',
        textColor: '#1a1a1a',
      },
    },
    elements: [
      {
        id: nid(),
        type: 'headingText',
        x: 0.1,
        y: 0.28,
        text: 'That\u2019s a wrap.',
        fontSize: 44,
        color: '#111111',
        font: 'Georgia, serif',
        lineHeight: 1.05,
        bold: false,
        width: 0.8,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'bodyText',
        x: 0.1,
        y: 0.5,
        text: 'Save this post for later and follow for more weekly drops.',
        fontSize: 15,
        color: '#4a4a4a',
        font: 'Inter, system-ui, sans-serif',
        lineHeight: 1.4,
        width: 0.8,
        snap: 'free',
      },
      {
        id: nid(),
        type: 'logoPill',
        x: 0,
        y: 0,
        text: '★  SAVE FOR LATER',
        bgColor: '#e07a3f',
        textColor: '#ffffff',
        fontSize: 12,
        snap: 'bottom-center',
      },
    ],
  },
];

export function getTemplate(id: TemplateId): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}