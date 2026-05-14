export interface PepperInfo {
  name: string;
  scovilleMin: number;
  scovilleMax: number;
  emoji: string;
  description: string;
}

export const PEPPER_DATA: Record<number, PepperInfo> = {
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
  4: {
    name: 'Habanero',
    scovilleMin: 100_000,
    scovilleMax: 350_000,
    emoji: '🔥',
    description: 'Serious heat — complex task',
  },
  5: {
    name: 'Carolina Reaper',
    scovilleMin: 1_400_000,
    scovilleMax: 2_200_000,
    emoji: '💀',
    description: 'Danger zone — very complex task',
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