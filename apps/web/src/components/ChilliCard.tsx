import { VoteValue, PEPPER_DATA } from '../types';
import './ChilliCard.css';

interface Props {
  value: VoteValue;
  selected: boolean;
  templateId: string;
  revealed?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function ChilliCard({ value, selected, onClick, disabled, revealed }: Props) {
  const isAbstain = value === '?';
  const pepper = isAbstain ? null : PEPPER_DATA[value as number];

  return (
    <button
      className={`chilli-card ${selected ? 'selected' : ''} ${revealed ? 'revealed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className="chilli-card-emoji">{isAbstain ? '❓' : pepper?.emoji ?? '🌶️'}</span>
      <span className="chilli-card-value">{value}</span>
    </button>
  );
}