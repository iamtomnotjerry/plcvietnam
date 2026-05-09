'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { footerEase } from '@/features/layout/footer/footer-motion';

export function FooterBackToTop() {
  const t = useTranslations('footer');
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 8 }}
          transition={{
            duration: reducedMotion ? 0 : 0.35,
            ease: footerEase,
          }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-background hover:bg-primary/92 md:right-10"
          aria-label={t('backToTop')}
        >
          <ChevronUp className="h-6 w-6" strokeWidth={2} aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
