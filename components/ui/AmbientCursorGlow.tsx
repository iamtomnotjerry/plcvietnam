'use client';

/**
 * Soft cursor-following glow — desktop + fine pointer only; off when reduced motion or touch.
 */

import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AmbientCursorGlow() {
  const reduceMotion = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === 'undefined') return;
    if (typeof window.matchMedia !== 'function') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setActive(true);
    };
    const onLeave = () => setActive(false);

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] hidden md:block motion-reduce:hidden"
      aria-hidden
    >
      <div
        className="absolute h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl transition-opacity duration-500"
        style={{
          left: pos.x,
          top: pos.y,
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}
