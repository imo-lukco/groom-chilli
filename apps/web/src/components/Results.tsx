import { Player, VoteValue } from '@groom-chilli/shared';
import { PEPPER_DATA, formatScoville } from '@groom-chilli/shared';
import { FUN_FACTS } from '../data/funFacts';
import './Results.css';

interface Props {
  players: Player[];
  funFactIndex: number | null;
}

// Returns the agreed value only when every numeric vote is identical.
function unanimousVote(players: Player[]): number | null {
  const numeric = players
    .map((p) => p.vote)
    .filter((v): v is number => typeof v === 'number');
  if (!numeric.length) return null;
  return numeric.every((v) => v === numeric[0]) ? numeric[0] : null;
}

function consensusVote(players: Player[]): number | null {
  const numeric = players
    .map((p) => p.vote)
    .filter((v): v is number => typeof v === 'number');
  if (!numeric.length) return null;
  const freq: Record<number, number> = {};
  for (const v of numeric) freq[v] = (freq[v] ?? 0) + 1;
  return Number(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
}

function average(players: Player[]): number | null {
  const numeric = players
    .map((p) => p.vote)
    .filter((v): v is number => typeof v === 'number');
  if (!numeric.length) return null;
  return numeric.reduce((s, v) => s + v, 0) / numeric.length;
}

function voteCounts(players: Player[]): Map<VoteValue, number> {
  const map = new Map<VoteValue, number>();
  for (const p of players) {
    if (p.vote !== null) map.set(p.vote, (map.get(p.vote) ?? 0) + 1);
  }
  return map;
}

export default function Results({ players, funFactIndex }: Props) {
  const counts = voteCounts(players);
  const maxCount = Math.max(...counts.values(), 1);
  const consensus = consensusVote(players);
  const unanimous = unanimousVote(players);
  const avg = average(players);
  const pepper = unanimous !== null ? PEPPER_DATA[unanimous] : null;
  const funFact = unanimous !== null && funFactIndex !== null ? FUN_FACTS[funFactIndex] : null;

  return (
    <div className="results">
      <h2 className="section-title">🎉 Results</h2>

      {/* Bar chart */}
      <div className="results-bars">
        {[...counts.entries()].sort().map(([val, count]) => (
          <div key={String(val)} className="bar-row">
            <span className="bar-val">{val}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="bar-count">{count}×</span>
          </div>
        ))}
      </div>

      {avg !== null && (
        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">{avg.toFixed(1)}</span>
          </div>
          {consensus !== null && (
            <div className="stat-item">
              <span className="stat-label">Consensus</span>
              <span className="stat-value">{consensus}</span>
            </div>
          )}
        </div>
      )}

      {/* Pepper reveal + fun fact — only when all agree */}
      {pepper && (
        <div className="pepper-reveal">
          <div className="pepper-reveal-emoji">{pepper.emoji}</div>
          <div className="pepper-reveal-body">
            <p className="pepper-reveal-today">Today's Special</p>
            <p className="pepper-reveal-name">{pepper.name}</p>
            <p className="pepper-reveal-scoville">
              {formatScoville(pepper.scovilleMin, pepper.scovilleMax)} Scoville
            </p>
            <p className="pepper-reveal-desc">{pepper.description}</p>
          </div>
        </div>
      )}

      {funFact && (
        <div className="fun-fact">
          <span className="fun-fact-icon">🌶️</span>
          <div>
            <p className="fun-fact-label">Hot Fact</p>
            <p className="fun-fact-text">{funFact}</p>
          </div>
        </div>
      )}

      {counts.size === 0 && (
        <p className="results-empty">Nobody voted yet 🤷</p>
      )}
    </div>
  );
}