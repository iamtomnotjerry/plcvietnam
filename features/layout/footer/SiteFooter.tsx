'use client';

import type { ComponentType, SVGProps } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Home,
  Info,
  LayoutDashboard,
  Mail,
  Map,
  Newspaper,
  Rss,
  Search,
} from 'lucide-react';
import {
  SocialGlyphGitHub,
  SocialGlyphLinkedIn,
  SocialGlyphX,
} from '@/features/layout/footer/FooterSocialGlyphs';
import { Link } from '@/i18n/navigation';
import { FooterBackToTop } from '@/features/layout/footer/FooterBackToTop';
import { FooterDecorativeBg } from '@/features/layout/footer/FooterDecorativeBg';
import { FooterExploreLink } from '@/features/layout/footer/FooterExploreLink';
import { FooterResourceLink } from '@/features/layout/footer/FooterResourceLink';
import { FooterSocialButton } from '@/features/layout/footer/FooterSocialButton';
import { FooterThreeRStrip } from '@/features/layout/footer/FooterThreeRStrip';
import {
  FOOTER_EXPLORE_LINKS,
  FOOTER_RESOURCE_LINKS,
  FOOTER_SOCIAL,
  type SocialKey,
} from '@/features/layout/footer/footer-config';
import {
  footerContainerVariants,
  footerItemVariants,
} from '@/features/layout/footer/footer-motion';

const EXPLORE_ICONS = [Home, Newspaper, BookOpen, Info, Search] as const;
const RESOURCE_ICONS = [Rss, Map, LayoutDashboard] as const;

const SOCIAL_ICONS: Record<SocialKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  email: Mail,
  linkedin: SocialGlyphLinkedIn,
  github: SocialGlyphGitHub,
  twitter: SocialGlyphX,
};

export function SiteFooter() {
  const t = useTranslations('footer');
  const tSite = useTranslations('site');
  const tNav = useTranslations('nav');
  const reducedMotion = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-muted/25">
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <FooterDecorativeBg reducedMotion={!!reducedMotion} />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 grid gap-10 lg:grid-cols-12 lg:gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={
            reducedMotion
              ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
              : footerContainerVariants
          }
        >
          <motion.div
            className="lg:col-span-5"
            variants={
              reducedMotion
                ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
                : footerItemVariants
            }
          >
            <Link
              href="/"
              className="group mb-5 inline-flex items-center gap-3 rounded-xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <motion.span
                className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-md shadow-primary/15 ring-1 ring-primary/20"
                whileHover={reducedMotion ? undefined : { scale: 1.04, rotate: -1.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <Image
                  src="/logo.jpg"
                  alt={tSite('logoAlt')}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </motion.span>
              <span className="font-serif text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {tSite('brand')}
              </span>
            </Link>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t('tagline')}
            </p>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('connectTitle')}
              </p>
              <div className="flex flex-wrap gap-2">
                {FOOTER_SOCIAL.map(({ key, href, ariaKey }) => (
                  <FooterSocialButton
                    key={key}
                    href={href}
                    label={t(ariaKey)}
                    Icon={SOCIAL_ICONS[key]}
                    reducedMotion={!!reducedMotion}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-3"
            variants={
              reducedMotion
                ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
                : footerItemVariants
            }
          >
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <span className="h-1 w-6 rounded-full bg-primary/80" aria-hidden />
              {t('linksTitle')}
            </h3>
            <ul className="space-y-1">
              {FOOTER_EXPLORE_LINKS.map((item, i) => (
                <FooterExploreLink
                  key={item.href}
                  href={item.href}
                  label={tNav(item.navKey)}
                  Icon={EXPLORE_ICONS[i]!}
                  reducedMotion={!!reducedMotion}
                />
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="lg:col-span-4"
            variants={
              reducedMotion
                ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
                : footerItemVariants
            }
          >
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <span className="h-1 w-6 rounded-full bg-accent/90" aria-hidden />
              {t('resourcesTitle')}
            </h3>
            <ul className="space-y-1">
              {FOOTER_RESOURCE_LINKS.map((item, i) => (
                <FooterResourceLink
                  key={item.footerKey}
                  item={item}
                  label={t(item.footerKey)}
                  Icon={RESOURCE_ICONS[i]!}
                  reducedMotion={!!reducedMotion}
                />
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <FooterThreeRStrip />

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-8 sm:flex-row">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            {t('copyright', { year })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>

      <FooterBackToTop />
    </footer>
  );
}
