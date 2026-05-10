'use client';

import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Boxes,
  Cable,
  ChevronDown,
  Database,
  LayoutTemplate,
  Server,
  Shield,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArchitectureFlowAnimation } from '@/features/architecture/components/ArchitectureFlowAnimation';
import { ArchitectureTechIcon } from '@/features/architecture/components/ArchitectureTechIcon';
import { cardLiftVariants, motionEaseOut, staggerContainerVariants } from '@/lib/ui/motion';

type TechRow = { icon?: string; name: string; purpose: string; detail?: string };

const LAYER_ICONS: Record<string, LucideIcon> = {
  presentation: LayoutTemplate,
  api: Server,
  domain: Boxes,
  data: Database,
  security: Shield,
  crosscut: Wrench,
  integrations: Cable,
  quality: Sparkles,
};

export function ArchitecturePageClient() {
  const t = useTranslations('architecture');
  const reduceMotion = useReducedMotion();
  const layerIds = t.raw('layerIds') as string[];

  const flowSteps = [
    { label: t('flowUser'), key: 'user' },
    { label: t('flowNext'), key: 'next' },
    { label: t('flowApi'), key: 'api' },
    { label: t('flowData'), key: 'data' },
  ];

  return (
    <div className="space-y-8 sm:space-y-12">
      <motion.header
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.07] px-4 py-6 shadow-sm sm:px-8 sm:py-10"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: motionEaseOut }}
      >
        {!reduceMotion ? (
          <>
            <motion.div
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl"
              animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.38, 0.2] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
          </>
        ) : null}
        <div className="relative">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
            {t('badge')}
          </p>
          <h1 className="mt-2 text-pretty text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('subtitle')}
          </p>
        </div>
      </motion.header>

      <ArchitectureFlowAnimation
        steps={flowSteps}
        caption={t('flowCaption')}
        simHelp={t('flowSimHelp')}
      />

      <motion.div
        className="grid gap-4 md:grid-cols-2"
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        <motion.section
          variants={cardLiftVariants}
          className="rounded-2xl border border-border/70 bg-card px-4 py-5 shadow-sm sm:px-6"
        >
          <h2 className="text-base font-semibold text-foreground">{t('overviewTitle')}</h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('overviewBody')}
          </p>
        </motion.section>
        <motion.section
          variants={cardLiftVariants}
          className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.06] to-card px-4 py-5 shadow-sm sm:px-6"
        >
          <h2 className="text-base font-semibold text-foreground">{t('scaleTitle')}</h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('scaleBody')}
          </p>
        </motion.section>
      </motion.div>

      <motion.section
        className="flex gap-3 rounded-xl border border-dashed border-primary/25 bg-primary/[0.03] px-4 py-4 sm:items-start sm:gap-4 sm:px-5"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: motionEaseOut }}
      >
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">{t('docHintTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('docHintBody')}</p>
        </div>
      </motion.section>

      <section className="space-y-4" aria-labelledby="arch-layers-heading">
        <h2 id="arch-layers-heading" className="sr-only">
          {t('layersHeading')}
        </h2>
        {layerIds.map((id) => {
          const Icon = LAYER_ICONS[id] ?? Boxes;
          const tech = (t.raw(`layers.${id}.tech`) as TechRow[]) ?? [];
          return (
            <motion.div
              key={id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: motionEaseOut }}
            >
              <details
                id={`layer-${id}`}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm open:border-primary/30 open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-start gap-4 bg-gradient-to-r from-muted/20 to-transparent p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner">
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t(`layers.${id}.title`)}
                    </h3>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {t(`layers.${id}.plain`)}
                    </p>
                  </div>
                  <ChevronDown
                    className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="space-y-5 border-t border-border/60 bg-muted/[0.03] px-4 pb-5 pt-4 sm:px-5">
                  <p className="text-pretty text-sm leading-relaxed text-foreground/90">
                    <span className="font-semibold text-primary">{t('maintainLabel')}: </span>
                    {t(`layers.${id}.maintain`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wide text-foreground/70">
                      {t('pathsLabel')}:{' '}
                    </span>
                    <code className="rounded-md bg-muted/90 px-2 py-0.5 font-mono text-[0.7rem] text-foreground/90 sm:text-xs">
                      {t(`layers.${id}.paths`)}
                    </code>
                  </p>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{t('techHeading')}</h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                      {tech.map((row) => {
                        const iconId = row.icon ?? 'package';
                        return (
                          <div
                            key={`${id}-${row.name}`}
                            className="flex gap-3 rounded-xl border border-border/60 bg-background/80 p-3 shadow-sm dark:bg-card/50"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-foreground dark:bg-muted/25">
                              <ArchitectureTechIcon iconId={iconId} className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground">{row.name}</p>
                              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                                {row.purpose}
                              </p>
                              {row.detail ? (
                                <p className="mt-2 border-l-2 border-primary/35 pl-2.5 text-xs leading-relaxed text-muted-foreground">
                                  <span className="font-medium text-foreground/80">
                                    {t('techDetail')}:{' '}
                                  </span>
                                  {row.detail}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </details>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
