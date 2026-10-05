import { useEffect } from 'react';
import './PandaPeek.css';

interface Props {
  onDone: () => void;
}

// Easter egg: a panda peeks up from the bottom corner when you join the PANDA room.
export default function PandaPeek({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="panda-peek" aria-hidden>
      <div className="panda-peek-bubble">Let's react to some spice today ⚛️🌶️</div>
      <div className="panda-peek-body">
        <span className="panda-peek-panda">🐼</span>
        <span className="panda-peek-bamboo">🎋</span>
      </div>
    </div>
  );
}
