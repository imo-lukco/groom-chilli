export interface SkinDateRange {
  // Month and day as 'MM-DD', both inclusive. A range may wrap the new year ('12-20' to '01-06').
  from: string;
  to: string;
}

export interface Skin {
  // Set as <html data-skin="..."> so the skin's CSS can scope its overrides.
  id: string;
  // Turns the skin on automatically between these dates. The default skin has none.
  dates: SkinDateRange | null;
  // Big emoji on the Home hero, the room loading screen and the name popup.
  heroEmoji: string;
  favicon: string;
  tagline: string;
  confettiHappy: string[];
  confettiSad: string[];
}
