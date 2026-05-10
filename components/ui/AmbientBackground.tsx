'use client';

/**
 * Very subtle drifting gradients behind page content — disabled when prefers-reduced-motion.
 */

export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
      aria-hidden
    >
      <div className="ambient-blob ambient-blob-a absolute -top-[20%] left-[10%] h-[min(85vw,560px)] w-[min(85vw,560px)] rounded-full bg-primary/[0.07] blur-3xl" />
      <div className="ambient-blob ambient-blob-b absolute bottom-[5%] right-[12%] h-[min(75vw,480px)] w-[min(75vw,480px)] rounded-full bg-accent/[0.06] blur-3xl" />
    </div>
  );
}
