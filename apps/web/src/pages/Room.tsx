import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { Room as RoomType, VoteValue, TEMPLATES, DEFAULT_TEMPLATE_ID } from '../types';
import ChilliCard from '../components/ChilliCard';
import PlayerList from '../components/PlayerList';
import Results from '../components/Results';
import Confetti from '../components/Confetti';
import './Room.css';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [taskDraft, setTaskDraft] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMode, setConfettiMode] = useState<'happy' | 'sad'>('happy');

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('joined', ({ room, playerId }: { room: RoomType; playerId: string }) => {
      setRoom(room);
      setMyId(playerId);
      setTaskDraft(room.task);
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

    socket.on('error', ({ message }: { message: string }) => {
      alert(message);
      navigate('/');
    });

    // If we land here directly (page refresh), send a join request
    const name = sessionStorage.getItem('playerName');
    if (name && roomId) {
      socket.emit('join_room', { roomId, playerName: name });
    } else if (roomId) {
      navigate('/');
    }

    return () => {
      socket.off('joined');
      socket.off('room_updated');
      socket.off('error');
    };
  }, [roomId, navigate]);

  // Persist player name to session on first join
  useEffect(() => {
    if (myId && room) {
      const me = room.players.find((p) => p.id === myId);
      if (me) sessionStorage.setItem('playerName', me.name);
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
    navigator.clipboard.writeText(room?.id ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!room) {
    return (
      <main className="page room-loading">
        <span className="room-loading-emoji">🌶️</span>
        <p>Getting your table ready…</p>
      </main>
    );
  }

  return (
    <main className="page">
      {showConfetti && <Confetti mode={confettiMode} onDone={() => setShowConfetti(false)} />}

      {/* Room header */}
      <div className="room-header card">
        <div className="room-code-row">
          <span className="room-code-label">Room code</span>
          <code className="room-code">{room.id}</code>
          <button className="btn btn-ghost btn-sm" onClick={copyCode}>
            {copied ? '✅ Copied!' : '📋 Copy'}
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