// lib/world.ts
'use client';

export type WorldObjectId = 'butterflies' | 'clouds';

export type EnergyLevel = 'calm' | 'playful' | 'wild';

export type UserWorld = {
  /** Welcome page world style */
  style: 'flower' | 'butterflies';
  /** Which floating objects to render (only used when style = 'butterflies') */
  objects: WorldObjectId[];
  accentColor: string;
  energy: EnergyLevel;
};

export type WorldStyle = {
  id: 'flower' | 'butterflies';
  emoji: string;
  label: string;
  description: string;
};

export const WORLD_STYLES: WorldStyle[] = [
  {
    id: 'flower',
    emoji: '🌀',
    label: 'Flower of Life',
    description: 'Sacred geometry, breathing',
  },
  {
    id: 'butterflies',
    emoji: '🦋',
    label: 'Butterflies & Clouds',
    description: 'Soft, drifting, light',
  },
];

export const WORLD_OBJECTS: {
  id: WorldObjectId;
  emoji: string;
  label: string;
}[] = [
  { id: 'butterflies', emoji: '🦋', label: 'Butterflies' },
  { id: 'clouds', emoji: '☁️', label: 'Clouds' },
];

export const ENERGY_LEVELS: {
  id: EnergyLevel;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  { id: 'calm', emoji: '🧘', label: 'Calm', desc: 'Slow, meditative' },
  { id: 'playful', emoji: '🎈', label: 'Playful', desc: 'Bouncy, light' },
  { id: 'wild', emoji: '🔥', label: 'Wild', desc: 'Fast, chaotic' },
];

export const DEFAULT_WORLD: UserWorld = {
  style: 'flower',
  objects: ['butterflies', 'clouds'],
  accentColor: '#8b5cf6',
  energy: 'calm',
};

const STORAGE_KEY = 'postgen:world';

export function getWorld(): UserWorld {
  if (typeof window === 'undefined') return DEFAULT_WORLD;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORLD;
    const parsed = JSON.parse(raw) as Partial<UserWorld>;
    return {
      style: parsed.style === 'butterflies' ? 'butterflies' : 'flower',
      objects: Array.isArray(parsed.objects)
        ? parsed.objects.filter(
            (o): o is WorldObjectId => o === 'butterflies' || o === 'clouds'
          )
        : DEFAULT_WORLD.objects,
      accentColor: parsed.accentColor ?? DEFAULT_WORLD.accentColor,
      energy: parsed.energy ?? DEFAULT_WORLD.energy,
    };
  } catch {
    return DEFAULT_WORLD;
  }
}

export function saveWorld(world: UserWorld) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
}

export function clearWorld() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function energySpeed(energy: EnergyLevel): number {
  switch (energy) {
    case 'calm': return 1.4;
    case 'playful': return 1;
    case 'wild': return 0.55;
    default: return 1;
  }
}