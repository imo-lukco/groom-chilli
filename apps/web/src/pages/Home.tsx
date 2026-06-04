import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { socket } from '../socket';
import { Room, TEMPLATES, DEFAULT_TEMPLATE_ID } from '../types';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState(() => searchParams.get('room')?.toUpperCase() ?? '');
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
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
    socket.emit('create_room', { playerName: name, templateId });
  }

  function handleJoin(e: FormEvent) {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) { setError('Enter your name before joining'); return; }
    if (!roomId.trim()) return;
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
            onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
            maxLength={32}
          />
          <p className="home-name-hint">Add your name to join or create a room</p>
        </div>

        <form className="home-join-form" onSubmit={handleJoin}>
          <div>
            <label htmlFor="roomId">Room code</label>
            <input
              id="roomId"
              type="text"
              className="room-code-input"
              placeholder="e.g. AB12CD34"
              value={roomId}
              onChange={(e) => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
              maxLength={8}
            />
          </div>
          {error && <div className="error-msg">⚠️ {error}</div>}
          <button
            className="btn btn-secondary"
            type="submit"
            disabled={!roomId.trim()}
          >
            Join Room →
          </button>
        </form>

        <div className="divider">or create a new room</div>

        <div className="home-template-section">
          <p className="home-scale-label">Choose your template</p>
          <div className="home-template-grid">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`home-template-card ${templateId === t.id ? 'active' : ''}`}
                onClick={() => setTemplateId(t.id)}
              >
                <span className="home-template-emoji">{t.emoji}</span>
                <span className="home-template-name">{t.name}</span>
                <span className="home-template-values">
                  {t.values.map(String).join(' · ')}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary home-create-btn"
          onClick={handleCreate}
          disabled={!playerName.trim()}
        >
          🌶️ Create a New Room
        </button>
      </div>
    </main>
  );
}