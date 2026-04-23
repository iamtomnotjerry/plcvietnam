/**
 * NavigationProgress Component
 * Thin progress bar at the top of the page during client-side navigation
 * Validates Requirements: 17.3, 17.4, 17.5
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * NavigationProgress
 *
 * Displays a thin animated progress bar at the top of the page whenever
 * the Next.js pathname changes (client-side navigation).
 *
 * Requirement 17.3: Loading spinner / progress indicator during async operations
 * Requirement 17.4: Progress indicator at top of page during client-side navigation
 * Requirement 17.5: Initial render with Skeleton_UI within 100ms
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startProgress = () => {
    clearTimers();
    setWidth(0);
    setVisible(true);

    // Quickly advance to ~70% then slow down
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += current < 30 ? 10 : current < 60 ? 5 : 1;
      if (current >= 85) {
        clearInterval(intervalRef.current!);
        current = 85;
      }
      setWidth(current);
    }, 50);
  };

  const completeProgress = () => {
    clearTimers();
    setWidth(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
  };

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // Navigation started
      startProgress();
      prevPathname.current = pathname;

      // Complete shortly after pathname updates (render is done)
      timerRef.current = setTimeout(() => {
        completeProgress();
      }, 100);
    }

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Đang tải trang"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none"
    >
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
