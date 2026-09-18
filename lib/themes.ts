// lib/themes.ts
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
};

export const THEMES: Theme[] = [
  {
    id: 'white',
    name: 'Pure White',
    tagline: 'A clean canvas for ideas that deserve the spotlight.',
    emoji: '🤍',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    tagline: 'Create something beautiful, one little idea at a time.',
    emoji: '🌸',
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    tagline: 'Clear your mind and let the ideas flow.',
    emoji: '🌊',
  },
  {
    id: 'lemon',
    name: 'Lemon Cream',
    tagline: 'A little sunshine for your next idea.',
    emoji: '🍋',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    tagline: 'Take a breath, slow down, and start creating.',
    emoji: '🌿',
  },
  {
    id: 'peach',
    name: 'Peach',
    tagline: 'Turn small thoughts into something warm and wonderful.',
    emoji: '🍑',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    tagline: 'Give your imagination a little room to wander.',
    emoji: '💜',
  },
  {
    id: 'sky',
    name: 'Sky',
    tagline: 'Keep it light, keep it open, keep creating.',
    emoji: '🩵',
  },
  {
    id: 'tangerine',
    name: 'Tangerine',
    tagline: 'Bring some energy to the things you make.',
    emoji: '🧡',
  },
  {
    id: 'cherry',
    name: 'Cherry',
    tagline: 'Create boldly and leave a little color behind.',
    emoji: '❤️',
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    tagline: 'Think clearly, create freely, and make it yours.',
    emoji: '💙',
  },
  {
    id: 'sunshine',
    name: 'Sunshine',
    tagline: 'Bright ideas deserve a bright place to live.',
    emoji: '💛',
  },
];

export const DEFAULT_THEME: ThemeId = 'white';