// lib/templatePreviews.ts
import type { PostConfig, CanvasElement } from './types';

/**
 * Sample SVG data URLs used as preview photos.
 * They look like real photos but weigh almost nothing.
 */
const PHOTO_1 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="60%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g1)"/>
  <circle cx="320" cy="90" r="45" fill="#fff8dc" opacity="0.9"/>
  <path d="M0 380 Q80 320 160 370 T320 360 T400 390 L400 500 L0 500 Z" fill="#0f172a" opacity="0.55"/>
</svg>
`)}`;

const PHOTO_2 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="55%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g2)"/>
  <circle cx="200" cy="220" r="70" fill="#e2e8f0" opacity="0.85"/>
  <circle cx="180" cy="205" r="8" fill="#0f172a"/>
  <circle cx="220" cy="205" r="8" fill="#0f172a"/>
  <path d="M180 250 Q200 265 220 250" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect y="380" width="400" height="120" fill="#0f172a" opacity="0.6"/>
</svg>
`)}`;

const PHOTO_3 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbcfe8"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g3)"/>
  <circle cx="200" cy="160" r="90" fill="#fef3c7" opacity="0.6"/>
  <path d="M120 300 Q200 260 280 300 L280 500 L120 500 Z" fill="#1e1b4b" opacity="0.5"/>
</svg>
`)}`;

const PHOTO_DARK = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#111827"/>
  <rect y="0" width="400" height="180" fill="#1f2937"/>
  <circle cx="200" cy="240" r="80" fill="#374151"/>
  <circle cx="180" cy="220" r="7" fill="#fafafa"/>
  <circle cx="220" cy="220" r="7" fill="#fafafa"/>
  <path d="M180 270 Q200 285 220 270" stroke="#fafafa" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
`)}`;

const PHOTO_NEWS = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#0f172a"/>
  <rect x="60" y="100" width="130" height="220" rx="18" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <rect x="210" y="100" width="130" height="220" rx="18" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <circle cx="105" cy="150" r="18" fill="#0ea5e9"/>
  <circle cx="255" cy="150" r="18" fill="#e2e8f0"/>
  <rect x="75" y="200" width="100" height="8" rx="4" fill="#334155"/>
  <rect x="225" y="200" width="100" height="8" rx="4" fill="#334155"/>
  <rect x="75" y="220" width="80" height="8" rx="4" fill="#334155"/>
  <rect x="225" y="220" width="80" height="8" rx="4" fill="#334155"/>
</svg>
`)}`;

/**
 * Returns a base PostConfig populated with fictional sample content,
 * designed to render beautifully as a preview thumbnail.
 */
export function getPreviewConfig(templateId: string, current: PostConfig): PostConfig {
  const base: PostConfig = {
    ...current,
    backgroundImage: null,
    paperBg: 'none',
    header: { ...current.header, enabled: false },
    headline: '',
    highlightWord: '',
    elements: [],
  };

  switch (templateId) {
    // ---------------- CLASSIC ----------------
    case 'forbes':
      return {
        ...base,
        backgroundImage: PHOTO_1,
        headline: 'BIG IDEAS SHAPING THE FUTURE OF WORK',
        highlightWord: 'FUTURE',
        font: 'Impact, "Arial Black", sans-serif',
        fontSize: 30,
        textColor: '#ffffff',
        highlightColor: '#00d97e',
        align: 'left',
        uppercase: true,
        overlayStyle: 'solid',
        overlayOpacity: 0.45,
        textY: 1,
        textShadow: { color: '#000', blur: 4, offsetX: 0, offsetY: 2 },
      };

    case 't3ch':
      return {
        ...base,
        backgroundImage: PHOTO_NEWS,
        headline: 'SMARTPHONE SHOWDOWN 2026 — THE FOLD IS BACK',
        highlightWord: 'FOLD',
        font: 'Impact, "Arial Black", sans-serif',
        fontSize: 26,
        textColor: '#ffffff',
        highlightColor: '#fbbf24',
        align: 'left',
        uppercase: true,
        overlayStyle: 'gradient-bottom',
        overlayOpacity: 0.85,
        textY: 1,
        textShadow: { color: '#000', blur: 4, offsetX: 0, offsetY: 2 },
        elements: [
          { id: 'pv-t3ch-logo', type: 'logoPill', x: 0, y: 0, text: 'T3CH', bgColor: '#ef4444', textColor: '#ffffff', fontSize: 12, snap: 'top-center' },
          { id: 'pv-t3ch-arrow', type: 'swipeArrow', x: 0, y: 0, size: 0.08, bgColor: '#ffffff', textColor: '#000000', snap: 'middle-right' },
        ],
      };

    case 'quote':
      return {
        ...base,
        backgroundImage: PHOTO_2,
        headline: 'IDEAS BECOME POWERFUL WHEN YOU SHIP THEM',
        highlightWord: 'POWERFUL',
        font: 'Georgia, serif',
        fontSize: 22,
        textColor: '#ffffff',
        highlightColor: '#fbbf24',
        align: 'left',
        uppercase: false,
        overlayStyle: 'gradient-bottom',
        overlayOpacity: 0.9,
        textY: 1,
        textShadow: { color: '#000', blur: 6, offsetX: 0, offsetY: 2 },
        elements: [
          { id: 'pv-quote-circle', type: 'circleImage', x: 0.68, y: 0.08, size: 0.28, imageUrl: PHOTO_3, snap: 'free' },
        ],
      };

    case 'yen':
      return {
        ...base,
        backgroundImage: PHOTO_2,
        headline: 'THE STORY EVERYONE IS TALKING ABOUT THIS WEEK',
        highlightWord: 'TALKING',
        font: 'Impact, "Arial Black", sans-serif',
        fontSize: 22,
        textColor: '#ffffff',
        highlightColor: '#fbbf24',
        align: 'left',
        uppercase: true,
        overlayStyle: 'gradient-bottom',
        overlayOpacity: 0.95,
        textY: 1,
        textShadow: { color: '#000', blur: 4, offsetX: 0, offsetY: 2 },
        elements: [
          { id: 'pv-yen-pill', type: 'logoPill', x: 0, y: 0, text: 'TRENDING', bgColor: '#fbbf24', textColor: '#000000', fontSize: 11, snap: 'middle-center' },
          { id: 'pv-yen-circle', type: 'circleImage', x: 0.7, y: 0.68, size: 0.24, imageUrl: PHOTO_3, snap: 'free' },
        ],
      };

    case 'terminal':
      return {
        ...base,
        backgroundImage: PHOTO_DARK,
        headline: 'npm install && npm run dev',
        font: '"Courier New", monospace',
        fontSize: 20,
        textColor: '#22ff22',
        highlightColor: '#ffffff',
        align: 'left',
        uppercase: false,
        overlayStyle: 'none',
        overlayOpacity: 0,
        textY: 0.7,
        elements: [
          { id: 'pv-term-logo', type: 'logoPill', x: 0, y: 0, text: '</>', bgColor: '#22c55e', textColor: '#000000', fontSize: 12, snap: 'top-left' },
        ],
      };

    // ---------------- EDITORIAL ----------------
    case 'editorial':
      return {
        ...base,
        paperBg: 'grid',
        header: {
          enabled: true,
          handle: '@yourhandle',
          showCounter: true,
          showProgress: true,
          accentColor: '#e07a3f',
          textColor: '#1a1a1a',
        },
        elements: [
          { id: 'pv-ed-num', type: 'headingNumber', x: 0.06, y: 0.16, number: '01', fontSize: 60, color: '#e07a3f', font: 'Georgia, serif', italic: true, snap: 'free' },
          { id: 'pv-ed-head', type: 'headingText', x: 0.28, y: 0.2, text: 'The quiet app taking over your browser.', fontSize: 20, color: '#111111', font: 'Inter, system-ui, sans-serif', lineHeight: 1.05, bold: true, width: 0.66, align: 'left', shadow: false, snap: 'free' },
          { id: 'pv-ed-body', type: 'bodyText', x: 0.06, y: 0.42, text: 'A tiny tool that streams live flights, ships, and cameras into one clean 3D view.', fontSize: 10, color: '#4a4a4a', font: 'Inter, system-ui, sans-serif', lineHeight: 1.4, width: 0.88, align: 'left', snap: 'free' },
          { id: 'pv-ed-card', type: 'card', x: 0.06, y: 0.68, width: 0.88, title: 'username/project-name', subtitle: 'A short description of what this thing is and why it matters.', stats: [ { icon: '★', value: '10.5k', label: 'Stars' }, { icon: '⑂', value: '2.2k', label: 'Forks' }, { icon: '◎', value: '88', label: 'Issues' } ], bgColor: '#ffffff', titleColor: '#111111', subtitleColor: '#666666', accentColor: '#fbbf24', shadow: true, snap: 'free' },
        ],
      };

    case 'editorialCover':
      return {
        ...base,
        paperBg: 'cream',
        header: {
          enabled: true,
          handle: '@yourhandle',
          showCounter: false,
          showProgress: false,
          accentColor: '#e07a3f',
          textColor: '#1a1a1a',
        },
        elements: [
          { id: 'pv-ec-tag', type: 'bodyText', x: 0.08, y: 0.14, text: 'TRENDING · THIS WEEK', fontSize: 9, color: '#e07a3f', font: 'Inter, system-ui, sans-serif', lineHeight: 1.2, width: 0.84, align: 'left', snap: 'free' },
          { id: 'pv-ec-num', type: 'headingNumber', x: 0.08, y: 0.24, number: '5', fontSize: 110, color: '#e07a3f', font: 'Georgia, serif', italic: true, snap: 'free' },
          { id: 'pv-ec-head', type: 'headingText', x: 0.32, y: 0.3, text: 'Things that happened this week', fontSize: 24, color: '#111111', font: 'Georgia, serif', lineHeight: 1.05, bold: false, width: 0.6, align: 'left', shadow: false, snap: 'free' },
          { id: 'pv-ec-sub', type: 'bodyText', x: 0.08, y: 0.78, text: 'and which ones actually matter', fontSize: 13, color: '#4a4a4a', font: 'Georgia, serif', lineHeight: 1.2, width: 0.84, align: 'left', snap: 'free' },
        ],
      };

    case 'editorialOutro':
      return {
        ...base,
        paperBg: 'cream',
        header: {
          enabled: true,
          handle: '@yourhandle',
          showCounter: true,
          showProgress: true,
          accentColor: '#e07a3f',
          textColor: '#1a1a1a',
        },
        elements: [
          { id: 'pv-eo-head', type: 'headingText', x: 0.1, y: 0.3, text: 'That’s a wrap.', fontSize: 40, color: '#111111', font: 'Georgia, serif', lineHeight: 1.05, bold: false, width: 0.8, align: 'left', shadow: false, snap: 'free' },
          { id: 'pv-eo-body', type: 'bodyText', x: 0.1, y: 0.52, text: 'Save this post for later and follow for more.', fontSize: 13, color: '#4a4a4a', font: 'Inter, system-ui, sans-serif', lineHeight: 1.4, width: 0.8, align: 'left', snap: 'free' },
          { id: 'pv-eo-pill', type: 'logoPill', x: 0, y: 0, text: '★ SAVE FOR LATER', bgColor: '#e07a3f', textColor: '#ffffff', fontSize: 11, snap: 'bottom-center' },
        ],
      };

    // ---------------- SPLIT QUOTE ----------------
    case 'splitQuote':
      return {
        ...base,
        overlayStyle: 'cinematic',
        overlayOpacity: 1,
        elements: [
          { id: 'pv-sq-split', type: 'splitImage', x: 0, y: 0, width: 1, height: 0.62, leftImageUrl: PHOTO_2, rightImageUrl: PHOTO_1, splitRatio: 0.5, divider: 'none', dividerColor: '#ffffff', snap: 'free' },
          { id: 'pv-sq-qm', type: 'quoteMark', x: 0.055, y: 0.48, char: '“', fontSize: 80, color: '#ffffff', font: 'Georgia, serif', snap: 'free' },
          { id: 'pv-sq-head', type: 'headingText', x: 0.055, y: 0.62, text: 'THE BEST IDEAS COME FROM PEOPLE WHO SHIP EVERY DAY.', fontSize: 22, color: '#ffffff', font: 'Inter, system-ui, sans-serif', lineHeight: 1.12, bold: true, width: 0.89, align: 'left', shadow: true, snap: 'free' },
          { id: 'pv-sq-attr', type: 'attribution', x: 0.055, y: 0.9, text: '-YOUR NAME, EVENT (YEAR)', fontSize: 10, color: '#ffffff', font: 'Inter, system-ui, sans-serif', letterSpacing: 0.5, uppercase: false, bold: true, width: 0.89, align: 'left', snap: 'free' },
        ],
      };

    case 'splitQuoteDark':
      return {
        ...base,
        overlayStyle: 'double',
        overlayOpacity: 1,
        elements: [
          { id: 'pv-sqd-split', type: 'splitImage', x: 0, y: 0, width: 1, height: 0.58, leftImageUrl: PHOTO_2, rightImageUrl: PHOTO_3, splitRatio: 0.5, divider: 'gap', dividerColor: '#ffffff', snap: 'free' },
          { id: 'pv-sqd-head', type: 'headingText', x: 0.055, y: 0.62, text: 'THE BEST STORIES START WITH A SINGLE LINE.', fontSize: 24, color: '#ffffff', font: 'Impact, "Arial Black", sans-serif', lineHeight: 1.1, bold: true, width: 0.89, align: 'left', shadow: true, snap: 'free' },
          { id: 'pv-sqd-attr', type: 'attribution', x: 0.055, y: 0.9, text: '-YOUR NAME, SOURCE (YEAR)', fontSize: 10, color: '#ffffff', font: 'Inter, system-ui, sans-serif', letterSpacing: 0.5, uppercase: false, bold: true, width: 0.89, align: 'left', snap: 'free' },
        ],
      };

    case 'memorial':
      return {
        ...base,
        backgroundImage: PHOTO_2,
        overlayStyle: 'bottom-half',
        overlayOpacity: 1,
        align: 'left',
        elements: [
          { id: 'pv-mem-circle', type: 'circleImage', x: 0.06, y: 0.3, size: 0.3, imageUrl: PHOTO_3, snap: 'free' },
          { id: 'pv-mem-head', type: 'headingText', x: 0.055, y: 0.62, text: 'HAPPY BIRTHDAY TO SOMEONE GREAT — WE MISS YOU EVERY DAY', fontSize: 20, color: '#ffffff', font: 'Impact, "Arial Black", sans-serif', lineHeight: 1.12, bold: true, width: 0.89, align: 'left', shadow: true, snap: 'free' },
          { id: 'pv-mem-attr', type: 'attribution', x: 0.055, y: 0.93, text: 'SWIPE FOR MORE', fontSize: 10, color: '#ffffff', font: 'Inter, system-ui, sans-serif', letterSpacing: 1.5, uppercase: true, bold: true, width: 0.89, align: 'center', snap: 'free' },
        ],
      };

    default:
      return base;
  }
}