import { Player } from '../types';
import './PlayerList.css';

const AVATARS = ['🧑‍🍳', '👨‍🍳', '👩‍🍳', '🌮', '🪅', '🎸', '🦜', '🌵', '🎺', '🎉'];

function avatarFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATARS[hash % AVATARS.length];
}

interface Props {
  players: Player[];
  myId: string;
  revealed: boolean;
}

export default function PlayerList({ players, myId, revealed }: Props) {
  return (
    <div className="player-list">
      <h3 className="section-title" style={{ fontSize: '1rem' }}>La Banda 🎉</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id} className={`player-row ${p.id === myId ? 'me' : ''}`}>
            <span className="player-avatar">{avatarFor(p.name)}</span>
            <span className="player-name">
              {p.name}
              {p.id === myId && <em> (you)</em>}
            </span>
            <span className="player-status">
              {revealed ? (
                p.vote !== null ? (
                  <span className="vote-badge">{p.vote}</span>
                ) : (
                  <span className="vote-badge muted">—</span>
                )
              ) : p.vote !== null ? (
                <span className="voted-dot">🔴</span>
              ) : (
                <span className="pending-dot" />
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}