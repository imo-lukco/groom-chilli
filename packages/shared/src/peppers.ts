export interface PepperInfo {
  name: string;
  scovilleMin: number;
  scovilleMax: number;
  emoji: string;
  description: string;
}

// Keys match all values used across templates (Veverka: 1,2,3,5,8,13,21 / Panda: 0.5,1,2,3,5,8,13)
export const PEPPER_DATA: Record<number, PepperInfo> = {
  0.5: {
    name: 'Banana Pepper',
    scovilleMin: 0,
    scovilleMax: 500,
    emoji: '🍌',
    description: 'Barely a tingle — practically a non-task',
  },
  1: {
    name: 'Bell Pepper',
    scovilleMin: 0,
    scovilleMax: 0,
    emoji: '🫑',
    description: 'Zero heat — trivial task',
  },
  2: {
    name: 'Jalapeño',
    scovilleMin: 2_500,
    scovilleMax: 8_000,
    emoji: '🌶️',
    description: 'A little kick — easy task',
  },
  3: {
    name: 'Serrano',
    scovilleMin: 10_000,
    scovilleMax: 23_000,
    emoji: '🌶️🌶️',
    description: 'Getting spicy — moderate task',
  },
  5: {
    name: 'Habanero',
    scovilleMin: 100_000,
    scovilleMax: 350_000,
    emoji: '🔥',
    description: 'Serious heat — complex task',
  },
  8: {
    name: 'Ghost Pepper',
    scovilleMin: 855_000,
    scovilleMax: 1_041_427,
    emoji: '👻',
    description: 'Once used in military grenades — very complex task',
  },
  13: {
    name: 'Trinidad Moruga Scorpion',
    scovilleMin: 1_200_000,
    scovilleMax: 2_000_000,
    emoji: '🦂',
    description: 'Can cause temporary blindness — extremely complex task',
  },
  21: {
    name: 'Pepper X',
    scovilleMin: 2_500_000,
    scovilleMax: 3_180_000,
    emoji: '☠️',
    description: 'Current world record holder — pure madness',
  },
};

export function formatScoville(min: number, max: number): string {
  if (min === 0 && max === 0) return '0 SHU';
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `${Math.round(n / 1_000)}k`
      : `${n}`;
  return `${fmt(min)} – ${fmt(max)} SHU`;
}