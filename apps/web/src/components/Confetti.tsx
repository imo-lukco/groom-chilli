import { useEffect, useRef } from 'react';
import './Confetti.css';

const EMOJIS = ['🌶️', '🫑', '🔥', '🌮', '🪅', '💀'];

interface Props {
  onDone: () => void;
}

export default function Confetti({ onDone }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pieces = Array.from({ length: 28 }, (_, i) => {
      const el = document.createElement('span');
      el.className = 'confetti-piece';
      el.textContent = EMOJIS[i % EMOJIS.length];
      el.style.left = `${Math.random() * 100}vw`;
      el.style.animationDelay = `${Math.random() * 0.8}s`;
      el.style.fontSize = `${1.2 + Math.random() * 1.4}rem`;
      container.appendChild(el);
      return el;
    });

    const timer = setTimeout(() => {
      onDone();
    }, 2400);

    return () => {
      clearTimeout(timer);
      pieces.forEach((el) => el.remove());
    };
  }, [onDone]);

  return <div ref={containerRef} className="confetti-container" aria-hidden />;
}