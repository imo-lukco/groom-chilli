import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, clientId } from '../socket';
import { Room as RoomType, VoteValue, TEMPLATES, DEFAULT_TEMPLATE_ID } from '../types';
import ChilliCard from '../components/ChilliCard';
import PlayerList from '../components/PlayerList';
import Results from '../components/Results';
import Confetti from '../components/Confetti';
import NameModal from '../components/NameModal';
import PandaPeek from '../components/PandaPeek';
import { skin } from '../skins';
import './Room.css';

// The permanent room from apps/server/src/roomManager.ts that gets the panda easter egg
const PANDA_ROOM_ID = 'PANDA';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [taskDraft, setTaskDraft] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMode, setConfettiMode] = useState<'happy' | 'sad'>('happy');
  const [playerName, setPlayerName] = useState(() => sessionStorage.getItem('playerName'));
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [showPanda, setShowPanda] = useState(false);
  // Once per page load, so socket reconnects (which re-emit `joined`) do not replay it
  const pandaShown = useRef(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('joined', ({ room, playerId }: { room: RoomType; playerId: string }) => {
      setRoom(room);
      setMyId(playerId);
      setTaskDraft(room.task);
      if (room.id === PANDA_ROOM_ID && !pandaShown.current) {
        pandaShown.current = true;
        setShowPanda(true);
      }
    });

    socket.on('room_updated', ({ room }: { room: RoomType }) => {
      setRoom((prev) => {
        if (!prev?.revealed && room.revealed) {
          const numeric = room.players.map((p) => p.vote).filter((v): v is number => typeof v === 'number');
          const unanimous = numeric.length > 0 && numeric.every((v) => v === numeric[0]);
          setConfettiMode(unanimous ? 'happy' : 'sad');
          setShowConfetti(true);
        }
        return room;
      });
      setTaskDraft((d) => (d !== room.task ? room.task : d));
    });

    socket.on('error', ({ message, code }: { message: string; code?: string }) => {
      if (code === 'name_taken') {
        sessionStorage.removeItem('playerName');
        setPlayerName(null);
        setNameError(message);
      } else {
        setError(message);
      }
    });

    // Re-join the room whenever the socket (re)connects. socket.io reconnects
    // with a fresh socket.id after any network blip / tab backgrounding, and the
    // server keys rooms by socket.id — without re-joining, votes silently drop
    // and cards appear frozen until a manual refresh.
    // Without a name (e.g. opened from a shared link) the name popup is shown
    // and the join waits until the player submits it.
    const rejoin = () => {
      if (playerName && roomId) socket.emit('join_room', { roomId, playerName, clientId });
    };

    if (playerName) {
      socket.on('connect', rejoin);
      if (!socket.connected) socket.connect();
      else rejoin();
    }

    return () => {
      socket.off('connect', rejoin);
      socket.off('joined');
      socket.off('room_updated');
      socket.off('error');
    };
  }, [roomId, playerName]);

  // Persist player name to session on first join, and remember it for the next shared link
  useEffect(() => {
    if (myId && room) {
      const me = room.players.find((p) => p.id === myId);
      if (me) {
        sessionStorage.setItem('playerName', me.name);
        localStorage.setItem('playerName', me.name);
      }
    }
  }, [myId, room]);

  const myVote = room?.players.find((p) => p.id === myId)?.vote ?? null;
  const template = TEMPLATES.find((t) => t.id === (room?.templateId ?? DEFAULT_TEMPLATE_ID))!;
  const anyVoted = room?.players.some((p) => p.vote !== null) ?? false;

  const castVote = useCallback((value: VoteValue) => {
    if (room?.revealed) return;
    socket.emit('cast_vote', { vote: value });
  }, [room]);

  function handleReveal() { socket.emit('reveal'); }
  function handleReset()  { socket.emit('reset');  }

  function handleTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (taskDraft.trim() !== room?.task) socket.emit('set_task', { task: taskDraft.trim() });
  }

  function copyCode() {
    const url = `${window.location.origin}/room/${room?.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const leaveToMenu = useCallback(() => navigate('/'), [navigate]);
  const hidePanda = useCallback(() => setShowPanda(false), []);

  const nameModal = (!playerName || error) && (
    <NameModal
      roomId={roomId ?? ''}
      defaultName={localStorage.getItem('playerName') ?? ''}
      error={error}
      nameError={nameError}
      onSubmit={(name) => {
        sessionStorage.setItem('playerName', name);
        setNameError('');
        setPlayerName(name);
      }}
      onCancel={leaveToMenu}
    />
  );

  if (!room) {
    return (
      <main className="page room-loading">
        {nameModal}
        <span className="room-loading-emoji">{skin.heroEmoji}</span>
        <p>Getting your table ready…</p>
      </main>
    );
  }

  return (
    <main className="page">
      {nameModal}
      {showPanda && <PandaPeek onDone={hidePanda} />}
      {showConfetti && <Confetti mode={confettiMode} onDone={() => setShowConfetti(false)} />}

      {/* Room header */}
      <div className="room-header card">
        <div className="room-code-row">
          <span className="room-code-label">Room code</span>
          <code className="room-code">{room.id}</code>
          <button className="btn btn-ghost btn-sm" onClick={copyCode}>
            {copied ? '✅ Copied!' : '🔗 Share'}
          </button>
          <button className="btn btn-ghost btn-sm room-leave-btn" onClick={() => { socket.emit('leave_room'); navigate('/'); }}>
            ← Leave
          </button>
        </div>

        {/* Task input */}
        <form className="room-task-form" onSubmit={handleTaskSubmit}>
          <input
            type="text"
            placeholder="What are we estimating? (e.g. Build checkout flow)"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            onBlur={handleTaskSubmit as unknown as React.FocusEventHandler}
          />
        </form>
      </div>

      <div className="room-body">
        {/* Voting area */}
        <div className="room-main">
          {!room.revealed ? (
            <>
              <h2 className="section-title">Pick your spice level 🌶️</h2>
              <div className="cards-grid">
                {template.values.map((v) => (
                  <ChilliCard
                    key={String(v)}
                    value={v}
                    selected={myVote === v}
                    templateId={room.templateId}
                    onClick={() => castVote(v)}
                    disabled={room.revealed}
                  />
                ))}
              </div>
              <div className="room-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleReveal}
                  disabled={!anyVoted}
                >
                  🔥 Reveal the Heat!
                </button>
              </div>
            </>
          ) : (
            <>
              <Results players={room.players} funFactIndex={room.funFactIndex} />
              <div className="room-actions" style={{ marginTop: 20 }}>
                <button className="btn btn-accent" onClick={handleReset}>
                  🔄 Next Round
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="room-sidebar">
          <PlayerList players={room.players} myId={myId} revealed={room.revealed} />
        </aside>
      </div>
    </main>
  );
}