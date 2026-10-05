import type { Skin, SkinDateRange } from './types';
import { chilli } from './chilli';
import { halloween } from './halloween';

// To add a skin: create <name>.ts (+ <name>.css scoped to [data-skin="<name>"]) and list it here.
const SKINS: Skin[] = [chilli, halloween];

function isInRange({ from, to }: SkinDateRange, today: string): boolean {
  return from <= to ? today >= from && today <= to : today >= from || today <= to;
}

// ?skin=<id> forces a skin for previewing (?skin=chilli turns a seasonal one off).
// Otherwise the first skin whose dates include today wins, falling back to chilli.
function pickSkin(): Skin {
  const forced = new URLSearchParams(window.location.search).get('skin');
  const forcedSkin = SKINS.find((s) => s.id === forced);
  if (forcedSkin) return forcedSkin;
  const now = new Date();
  const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return SKINS.find((s) => s.dates && isInRange(s.dates, today)) ?? chilli;
}

export const skin = pickSkin();

export function applySkin(): void {
  document.documentElement.dataset.skin = skin.id;
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (icon) {
    icon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${skin.favicon}</text></svg>`;
  }
}
