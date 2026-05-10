'use client';

/**
 * Subtle 3D tilt on pointer move — desktop only, disabled when prefers-reduced-motion.
 */

import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from 'framer-motion';

const MAX_TILT = 6;

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export function TiltCard({ children, className = '' }: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      setDesktop(false);
      return;
    }
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
  }, []);

  const onMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!ref.current || reduceMotion || !desktop) return;
      const r = ref.current.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = -py * MAX_TILT * 2;
      const ry = px * MAX_TILT * 2;
      ref.current.style.transform = `perspective(960px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    },
    [reduceMotion, desktop]
  );

  if (reduceMotion || !desktop) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`transform-gpu will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </div>
  );
}
