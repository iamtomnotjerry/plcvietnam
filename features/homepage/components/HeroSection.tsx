/**
 * HeroSection — editorial hero with motion
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface HeroSectionProps {
  title: string;
  tagline: string;
  description: string;
}

export function HeroSection({ title, tagline, description }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/[0.07] via-background to-accent/[0.06] py-20 md:py-28">
      <div className="container relative z-[1] mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center space-y-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            PLC · SCADA · Siemens
          </p>
          <h1
            className="text-[2.25rem] font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}
          >
            {title}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg font-medium text-primary md:text-xl"
          >
            {tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Đọc bài viết
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-muted"
            >
              Thư viện sách
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/[0.12] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-accent/[0.1] blur-3xl" />
      </div>
    </section>
  );
}
