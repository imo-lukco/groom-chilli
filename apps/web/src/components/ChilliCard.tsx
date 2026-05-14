import { VoteValue } from '@groom-chilli/shared';
import './ChilliCard.css';

const CHILLI_META: Record<string, { emoji: string; label: string }> = {
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
  templateId: string;
  revealed?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function ChilliCard({ value, selected, templateId, onClick, disabled, revealed }: Props) {
  const isChilli = templateId === 'chilli';
  const key = String(value);

  if (isChilli) {
    const meta = CHILLI_META[key] ?? { emoji: key, label: key };
    return (
      <button
        className={`chilli-card ${selected ? 'selected' : ''} ${revealed ? 'revealed' : ''}`}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
      >
        <span className="chilli-card-emoji">{meta.emoji}</span>
        <span className="chilli-card-value">{value}</span>
        <span className="chilli-card-label">{meta.label}</span>
      </button>
    );
  }

  // Non-chilli templates: plain number card, '?' gets its own treatment
  const isAbstain = value === '?';
  return (
    <button
      className={`chilli-card chilli-card--plain ${selected ? 'selected' : ''} ${revealed ? 'revealed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      {isAbstain
        ? <span className="chilli-card-emoji">❓</span>
        : <span className="chilli-card-value chilli-card-value--big">{value}</span>}
    </button>
  );
}