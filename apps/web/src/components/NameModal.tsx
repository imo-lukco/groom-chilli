import { useState, useEffect, FormEvent } from 'react';
import { skin } from '../skins';
import './NameModal.css';

interface Props {
  roomId: string;
  defaultName: string;
  error: string;
  nameError: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export default function NameModal({ roomId, defaultName, error, nameError, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(defaultName);
  // The popup remounts after every rejected join, so the error is only seeded on mount
  // and hidden once the player starts typing a new name, like the Home form.
  const [shownNameError, setShownNameError] = useState(nameError);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="name-modal-backdrop">
      <div className="card name-modal" role="dialog" aria-modal="true" aria-labelledby="name-modal-title">
        {error ? (
          <>
            <span className="name-modal-emoji">👻</span>
            <h2 id="name-modal-title" className="section-title">This table went cold</h2>
            <div className="error-msg">⚠️ {error}</div>
            <button className="btn btn-primary name-modal-submit" type="button" onClick={onCancel}>
              🌶️ Back to the Kitchen
            </button>
          </>
        ) : (
          <>
            <span className="name-modal-emoji">{skin.heroEmoji}</span>
            <h2 id="name-modal-title" className="section-title">Who's joining the table?</h2>
            <p className="name-modal-sub">
              You've been invited to room <code className="room-code">{roomId}</code>
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name-modal-input">Your name</label>
              <input
                id="name-modal-input"
                type="text"
                placeholder="e.g. Diego 🧑‍🍳"
                value={name}
                onChange={(e) => { setName(e.target.value); setShownNameError(''); }}
                maxLength={32}
                autoFocus
              />
              {shownNameError && <div className="error-msg">⚠️ {shownNameError}</div>}
              <button className="btn btn-primary name-modal-submit" type="submit" disabled={!name.trim()}>
                🔥 Join the Heat
              </button>
            </form>
            <button className="btn btn-ghost btn-sm name-modal-cancel" type="button" onClick={onCancel}>
              ← Back to menu
            </button>
          </>
        )}
      </div>
    </div>
  );
}
