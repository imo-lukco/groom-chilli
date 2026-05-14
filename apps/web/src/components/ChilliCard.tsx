import { VoteValue } from '@groom-chilli/shared';
import './ChilliCard.css';

const CARD_META: Record<string, { emoji: string; label: string }> = {
  '1': { emoji: '🫑', label: 'Trivial' },
  '2': { emoji: '🌶️', label: 'Easy' },
  '3': { emoji: '🌶️🌶️', label: 'Medium' },
  '4': { emoji: '🔥', label: 'Hard' },
  '5': { emoji: '💀', label: 'Reaper' },
  '?': { emoji: '❓', label: 'No idea' },
};

interface Props {
  value: VoteValue;
  selected: boolean;
  revealed?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function ChilliCard({ value, selected, onClick, disabled, revealed }: Props) {
  const key = String(value);
  const meta = CARD_META[key] ?? { emoji: String(value), label: String(value) };

  return (
    <button
      className={`chilli-card ${selected ? 'selected' : ''} ${revealed ? 'revealed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className="chilli-card-emoji">{meta.emoji}</span>
      <span className="chilli-card-value">{typeof value === 'number' ? value : value}</span>
      <span className="chilli-card-label">{meta.label}</span>
    </button>
  );
}