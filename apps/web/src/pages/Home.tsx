import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { Room } from '@groom-chilli/shared';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    socket.connect();

    socket.on('joined', ({ room }: { room: Room; playerId: string }) => {
      navigate(`/room/${room.id}`);
    });

    socket.on('error', ({ message }: { message: string }) => {
      setError(message);
    });

    return () => {
      socket.off('joined');
      socket.off('error');
    };
  }, [navigate]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) return;
    setError('');
    sessionStorage.setItem('playerName', name);
    socket.emit('create_room', { playerName: name });
  }

  function handleJoin(e: FormEvent) {
    e.preventDefault();
    const name = playerName.trim();
    if (!name || !roomId.trim()) return;
    setError('');
    sessionStorage.setItem('playerName', name);
    socket.emit('join_room', { roomId: roomId.trim(), playerName: name });
  }

  return (
    <main className="page">
      <div className="card home-card">
        <div className="home-hero">
          <span className="home-hero-emoji">🌶️</span>
          <h2 className="section-title" style={{ fontSize: '1.7rem' }}>¡Bienvenidos!</h2>
          <p className="home-sub">The spiciest way to estimate your tasks</p>
        </div>

        <div className="home-name-row">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Diego 🧑‍🍳"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={32}
          />
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <button
          className="btn btn-primary home-create-btn"
          onClick={handleCreate}
          disabled={!playerName.trim()}
        >
          🌶️ Create a New Room
        </button>

        <div className="divider">or join an existing room</div>

        <form className="home-join-form" onSubmit={handleJoin}>
          <div>
            <label htmlFor="roomId">Room code</label>
            <input
              id="roomId"
              type="text"
              placeholder="e.g. AB12CD34"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={8}
            />
          </div>
          <button
            className="btn btn-secondary"
            type="submit"
            disabled={!playerName.trim() || !roomId.trim()}
          >
            Join Room →
          </button>
        </form>

        <div className="home-scale-preview">
          <p className="home-scale-label">The Scoville Scale of Work</p>
          <div className="home-scale-row">
            {(['🫑', '🌶️', '🌶️🌶️', '🔥', '💀'] as const).map((e, i) => (
              <div key={i} className="home-scale-item">
                <span>{e}</span>
                <small>{['Trivial', 'Easy', 'Medium', 'Hard', 'Reaper'][i]}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}