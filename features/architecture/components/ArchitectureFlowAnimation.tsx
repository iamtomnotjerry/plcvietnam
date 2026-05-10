'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Braces, Cloud, Database, Monitor } from 'lucide-react';
import { motionDuration, motionEaseOut } from '@/lib/ui/motion';

const STEP_ICONS = [Monitor, Cloud, Braces, Database] as const;

type Step = { label: string; key: string };

type Props = {
  steps: Step[];
  caption: string;
  simHelp: string;
};

export function ArchitectureFlowAnimation({ steps, caption, simHelp }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-muted/25 via-card to-card px-4 py-6 sm:px-6"
      aria-labelledby="arch-flow-heading"
    >
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary/[0.09] blur-3xl"
          animate={{ x: [0, 40, 0], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"
          animate={{ y: [0, -24, 0], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}

      <div className="relative">
        <h2 id="arch-flow-heading" className="text-sm font-semibold text-foreground">
          {caption}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{simHelp}</p>

        <div className="relative mt-6">
          <div
            className="absolute left-[8%] right-[8%] top-[22px] hidden h-0.5 overflow-hidden rounded-full bg-border md:block"
            aria-hidden
          >
            {!reduceMotion ? (
              <motion.div
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
              />
            ) : null}
          </div>

          {!reduceMotion ? (
            <div
              className="absolute left-[8%] right-[8%] top-[18px] hidden h-4 md:block"
              aria-hidden
            >
              <motion.div
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                animate={{ left: ['12%', '37.5%', '62.5%', '88%', '12%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: motionEaseOut }}
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? Monitor;
              return (
                <motion.div
                  key={step.key}
                  className="relative flex flex-col items-center text-center"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    delay: reduceMotion ? 0 : i * 0.08,
                    duration: motionDuration.medium,
                    ease: motionEaseOut,
                  }}
                >
                  <motion.div
                    className="relative z-[1] flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-background/90 text-primary shadow-sm backdrop-blur-sm dark:bg-card/90"
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            boxShadow: [
                              '0 0 0 0 hsl(var(--primary) / 0)',
                              '0 0 0 6px hsl(var(--primary) / 0.12)',
                              '0 0 0 0 hsl(var(--primary) / 0)',
                            ],
                          }
                    }
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      delay: i * 0.55,
                      ease: 'easeInOut',
                    }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.65} aria-hidden />
                  </motion.div>
                  <p className="mt-3 text-xs font-medium leading-snug text-foreground sm:text-sm">
                    {step.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
