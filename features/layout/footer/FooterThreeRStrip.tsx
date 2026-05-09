'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Gauge, Layers, Recycle } from 'lucide-react';
import {
  footerCardVariants,
  footerContainerVariants,
} from '@/features/layout/footer/footer-motion';

const VALUE_ICONS = [Gauge, Layers, Recycle] as const;

export function FooterThreeRStrip() {
  const t = useTranslations('footer');
  const reducedMotion = useReducedMotion();

  const containerVariants: Variants = reducedMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : footerContainerVariants;

  const cardVariants: Variants = reducedMotion
    ? { hidden: { opacity: 1, y: 0, scale: 1 }, show: { opacity: 1, y: 0, scale: 1 } }
    : footerCardVariants;

  const items = [
    { title: t('reduceTitle'), body: t('reduceBody'), Icon: VALUE_ICONS[0] },
    { title: t('reuseTitle'), body: t('reuseBody'), Icon: VALUE_ICONS[1] },
    { title: t('recycleTitle'), body: t('recycleBody'), Icon: VALUE_ICONS[2] },
  ] as const;

  return (
    <motion.section
      className="mb-10"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={containerVariants}
      aria-labelledby="footer-values-heading"
    >
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
            {t('valuesEyebrow')}
          </p>
          <h2
            id="footer-values-heading"
            className="font-serif text-lg font-semibold text-foreground sm:text-xl"
          >
            {t('valuesHeading')}
          </h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ title, body, Icon }, i) => (
          <motion.article
            key={title}
            variants={cardVariants}
            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.12] transition-opacity group-hover:opacity-[0.2]"
              style={{
                background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
              }}
            />
            <div className="relative flex flex-col gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
            <span className="absolute right-4 top-4 font-mono text-[0.65rem] font-bold text-primary/35">
              {String(i + 1).padStart(2, '0')}
            </span>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
