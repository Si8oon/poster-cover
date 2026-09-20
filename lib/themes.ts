// lib/themes.ts
import type { MotionConfig } from './types';

export type ThemeId =
  | 'white'
  | 'sakura'
  | 'ocean'
  | 'lemon'
  | 'meadow'
  | 'peach'
  | 'lavender'
  | 'sky'
  | 'tangerine'
  | 'cherry'
  | 'cobalt'
  | 'sunshine';

export type Theme = {
  id: ThemeId;
  name: string;
  tagline: string;
  emoji: string;
  /** Default motion applied to new posts created while this theme is active */
  defaultMotion: MotionConfig;
};

export const THEMES: Theme[] = [
  {
    id: 'white',
    name: 'Pure White',
    tagline: 'A clean canvas for ideas that deserve the spotlight.',
    emoji: '🤍',
    defaultMotion: { type: 'none', speed: 1, intensity: 1 },
  },
  {
    id: 'sakura',
    name: 'Sakura',
    tagline: 'Create something beautiful, one little idea at a time.',
    emoji: '🌸',
    defaultMotion: { type: 'floating', speed: 1, intensity: 1 },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    tagline: 'Clear your mind and let the ideas flow.',
    emoji: '🌊',
    defaultMotion: { type: 'floating', speed: 1, intensity: 1 },
  },
  {
    id: 'lemon',
    name: 'Lemon Cream',
    tagline: 'A little sunshine for your next idea.',
    emoji: '🍋',
    defaultMotion: { type: 'breathing', speed: 1, intensity: 1 },
  },
  {
    id: 'meadow',
    name: 'Meadow',
    tagline: 'Take a breath, slow down, and start creating.',
    emoji: '🌿',
    defaultMotion: { type: 'breathing', speed: 0.7, intensity: 0.8 },
  },
  {
    id: 'peach',
    name: 'Peach',
    tagline: 'Turn small thoughts into something warm and wonderful.',
    emoji: '🍑',
    defaultMotion: { type: 'breathing', speed: 0.9, intensity: 1 },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    tagline: 'Give your imagination a little room to wander.',
    emoji: '💜',
    defaultMotion: { type: 'floating', speed: 0.8, intensity: 1 },
  },
  {
    id: 'sky',
    name: 'Sky',
    tagline: 'Keep it light, keep it open, keep creating.',
    emoji: '🩵',
    defaultMotion: { type: 'floating', speed: 1, intensity: 1 },
  },
  {
    id: 'tangerine',
    name: 'Tangerine',
    tagline: 'Bring some energy to the things you make.',
    emoji: '🧡',
    defaultMotion: { type: 'breathing', speed: 1.2, intensity: 1.2 },
  },
  {
    id: 'cherry',
    name: 'Cherry',
    tagline: 'Create boldly and leave a little color behind.',
    emoji: '❤️',
    defaultMotion: { type: 'breathing', speed: 1.1, intensity: 1.2 },
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    tagline: 'Think clearly, create freely, and make it yours.',
    emoji: '💙',
    defaultMotion: { type: 'breathing', speed: 1, intensity: 1 },
  },
  {
    id: 'sunshine',
    name: 'Sunshine',
    tagline: 'Bright ideas deserve a bright place to live.',
    emoji: '💛',
    defaultMotion: { type: 'floating', speed: 1.1, intensity: 1.1 },
  },
];

export const DEFAULT_THEME: ThemeId = 'white';

export function getTheme(id: ThemeId): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}