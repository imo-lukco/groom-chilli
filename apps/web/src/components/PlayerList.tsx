import { Player, VoteValue } from '../types';
import './PlayerList.css';

const AVATARS = ['🧑‍🍳', '👨‍🍳', '👩‍🍳', '🌮', '🪅', '🎸', '🦜', '🌵', '🎺', '🎉'];

function hashName(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return hash;
}

// Give every player a distinct avatar within the room. Start from the name's
// preferred slot, then linear-probe to the next free one so identical/colliding
// hashes no longer share an icon (unique until the pool of 10 is exhausted).
function assignAvatars(players: Player[]): Map<string, string> {
  const used = new Set<number>();
  const map = new Map<string, string>();
  for (const p of players) {
    let idx = hashName(p.name) % AVATARS.length;
    for (let tries = 0; used.has(idx) && tries < AVATARS.length; tries++) {
      idx = (idx + 1) % AVATARS.length;
    }
    used.add(idx);
    map.set(p.id, AVATARS[idx]);
  }
  return map;
}

// Numeric votes ascending; abstain '?' and non-voters sink to the bottom.
function voteRank(v: VoteValue | null): number {
  return typeof v === 'number' ? v : Number.POSITIVE_INFINITY;
}

interface Props {
  players: Player[];
  myId: string;
  revealed: boolean;
}

export default function PlayerList({ players, myId, revealed }: Props) {
  // Avatars are keyed off join order (stable) so sorting the display doesn't
  // reshuffle icons. Once revealed, order rows by vote value.
  const avatars = assignAvatars(players);
  const rows = revealed
    ? [...players].sort((a, b) => voteRank(a.vote) - voteRank(b.vote))
    : players;

  return (
    <div className="player-list">
      <h3 className="section-title" style={{ fontSize: '1rem' }}>La Banda 🎉</h3>
      <ul>
        {rows.map((p) => (
          <li key={p.id} className={`player-row ${p.id === myId ? 'me' : ''}`}>
            <span className="player-avatar">{avatars.get(p.id)}</span>
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