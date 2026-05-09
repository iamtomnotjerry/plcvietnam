/**
 * About Page Route
 * Display author information and credentials
 */

import { contentRepository } from '@/lib/data/factory';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { absoluteUrlForLocale } from '@/lib/i18n/urls';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { Route } from 'next';
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/utils/structuredData';

type StatItem = { value: string; label: string; icon: string };
type HighlightItem = { icon: string; title: string; desc: string };
type StepItem = { title: string; desc: string };
type IndustryItem = { icon: string; name: string; desc: string };
type BookItem = { title: string; sub: string };
type TimelineEntry = {
  period: string;
  role: string;
  org: string;
  desc: string;
  type: string;
};
type ProjectRow = { name: string; year: string; tech: string; role: string };
type HydroPlant = { name: string; org: string; capacity: string };
type TrainingRow = { year: string; client: string; content: string };

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [author, tNav, tAbout] = await Promise.all([
    contentRepository.getAuthor(),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'aboutPage' }),
  ]);
  return {
    title: `${tNav('about')} - ${author.name}`,
    description: tAbout('metaDescription'),
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [author, tNav, tAbout, tCommon] = await Promise.all([
    contentRepository.getAuthor(),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'aboutPage' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const stats = tAbout.raw('stats') as StatItem[];
  const expertiseHighlights = tAbout.raw('expertiseHighlights') as HighlightItem[];
  const processSteps = tAbout.raw('processSteps') as StepItem[];
  const industries = tAbout.raw('industries') as IndustryItem[];
  const sitrainPillars = tAbout.raw('sitrainPillars') as HighlightItem[];
  const publishedBooks = tAbout.raw('publishedBooks') as BookItem[];
  const bookValueProps = tAbout.raw('bookValueProps') as HighlightItem[];
  const communityRoleItems = tAbout.raw('communityRoleItems') as HighlightItem[];
  const shareContentItems = tAbout.raw('shareContentItems') as HighlightItem[];
  const impactItems = tAbout.raw('impactItems') as HighlightItem[];
  const timeline = tAbout.raw('timeline') as TimelineEntry[];
  const projectRows = tAbout.raw('projectRows') as ProjectRow[];
  const hydroBullets = tAbout.raw('hydroBullets') as string[];
  const hydroPlants = tAbout.raw('hydroPlants') as HydroPlant[];
  const trainingRows = tAbout.raw('trainingRows') as TrainingRow[];
  const skillIndustrialNetItems = tAbout.raw('skillIndustrialNetItems') as string[];
  const skillPlcItems = tAbout.raw('skillPlcItems') as string[];
  const skillScadaItems = tAbout.raw('skillScadaItems') as string[];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://plcvietnam.com';
  const profileUrl = absoluteUrlForLocale(locale, '/about', baseUrl);
  const personSchema = generatePersonSchema(author, profileUrl, tAbout('jsonLdJobTitle'));
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav('home'), url: absoluteUrlForLocale(locale, '/', baseUrl) },
    { name: tNav('about') },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <nav className="mb-6" aria-label={tAbout('breadcrumbAriaLabel')}>
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
                {tNav('home')}
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li>
              <span className="text-foreground font-medium">{tNav('about')}</span>
            </li>
          </ol>
        </nav>

        <div className="mb-6 flex justify-end">
          <Link
            href={'/admin/about/edit' as Route}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {tAbout('editCta')}
          </Link>
        </div>

        <div className="mb-12 text-center">
          {author.avatarUrl && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="200px"
                />
              </div>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{author.name}</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
              {tAbout('roleAutomationConsultant')}
            </span>
            <span className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
              {tAbout('roleSitrainManager')}
            </span>
            <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-md text-sm font-semibold">
              {tAbout('badgeExperience')}
            </span>
          </div>
          <p className="mt-4 text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            {tAbout('heroIntro')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <svg
                className="w-8 h-8 text-primary mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={stat.icon}
                />
              </svg>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {tAbout('profileSectionTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertiseHighlights.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 bg-card border border-border rounded-xl border-l-4 border-l-primary"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {tAbout('implementationSectionTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {tAbout('processTitle')}
              </h3>
              <ol className="space-y-3">
                {processSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2 border-l-4 border-primary">
                      <div className="text-sm font-semibold text-foreground">{step.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {tAbout('industriesTitle')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((ind) => (
                  <div
                    key={ind.name}
                    className="flex flex-col items-center p-3 bg-muted/50 rounded-xl border border-border text-center"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d={ind.icon}
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{ind.name}</div>
                    <div className="text-xs text-muted-foreground">{ind.desc}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {tAbout('industryMetricProjectsValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('industryMetricProjects')}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {tAbout('industryMetricSuccessValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('industryMetricSuccess')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">{tAbout('sitrainTitle')}</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground mb-6 leading-relaxed">{tAbout('sitrainIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sitrainPillars.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 p-4 bg-muted/40 rounded-xl border border-border"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">{tAbout('booksTitle')}</h2>
          <p className="text-muted-foreground mb-6">{tAbout('booksLead')}</p>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {publishedBooks.map((book) => (
                <div key={book.title} className="flex flex-col items-center">
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary to-blue-700 rounded-lg flex flex-col items-center justify-center p-3 shadow-md mb-2">
                    <svg
                      className="w-8 h-8 text-white mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                      />
                    </svg>
                    <div className="text-white text-xs font-bold text-center leading-tight">
                      {book.title}
                    </div>
                    <div className="text-white/70 text-xs text-center mt-1">{book.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bookValueProps.map((v) => (
                <div
                  key={v.title}
                  className="flex gap-3 items-start p-4 bg-muted/40 rounded-xl border border-border"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{v.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">{tAbout('communityTitle')}</h2>
          <p className="text-muted-foreground mb-6">{tAbout('communityLead')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {tAbout('communityRoleCardTitle')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('communityRoleCardSub')}
                  </div>
                </div>
              </div>
              <ul className="space-y-3 mb-4 flex-1">
                {communityRoleItems.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-2 p-2.5 bg-muted/40 rounded-lg border-l-2 border-primary"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-3 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">
                    {tAbout('communityMetricMembersValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('communityMetricMembers')}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">
                    {tAbout('communityMetricPostsValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('communityMetricPosts')}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {tAbout('shareContentCardTitle')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('shareContentCardSub')}
                  </div>
                </div>
              </div>
              <ul className="space-y-3 mb-4 flex-1">
                {shareContentItems.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-2 p-2.5 bg-muted/40 rounded-lg border-l-2 border-primary"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-3 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">
                    {tAbout('shareMetricTutorialsValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('shareMetricTutorials')}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">
                    {tAbout('shareMetricVideosValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">{tAbout('shareMetricVideos')}</div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {tAbout('impactCardTitle')}
                  </div>
                  <div className="text-xs text-muted-foreground">{tAbout('impactCardSub')}</div>
                </div>
              </div>
              <ul className="space-y-3 mb-4 flex-1">
                {impactItems.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-2 p-2.5 bg-muted/40 rounded-lg border-l-2 border-primary"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-3 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">
                    {tAbout('impactMetricLearnersValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('impactMetricLearners')}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">
                    {tAbout('impactMetricSatisfactionValue')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tAbout('impactMetricSatisfaction')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">{tAbout('eduWorkTitle')}</h2>
          <div className="space-y-4">
            {timeline.map((item) => (
              <div
                key={item.period}
                className="flex gap-4 p-5 bg-card border border-border rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mt-0.5">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.type === 'edu' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    )}
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {item.period}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.org}</span>
                  </div>
                  <div className="font-semibold text-foreground mb-1">{item.role}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {tAbout('projectsTableTitle')}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    {tAbout('projectsColProject')}
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    {tAbout('projectsColYear')}
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    {tAbout('projectsColTech')}
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    {tAbout('projectsColRole')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectRows.map((p, i) => (
                  <tr
                    key={`${p.name}-${p.year}`}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.tech}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">{tAbout('hydroSectionTitle')}</h2>
          <p className="text-muted-foreground mb-6">{tAbout('hydroSectionLead')}</p>
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <ul className="space-y-3">
              {hydroBullets.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hydroPlants.map((p) => (
              <div
                key={p.name}
                className="bg-card border border-border rounded-xl p-5 flex gap-3 items-start"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {tAbout('hydroPlantCapacity', { org: p.org, capacity: p.capacity })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {tAbout('trainingTableTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trainingRows.map((trow, i) => (
              <div
                key={`${trow.year}-${trow.client}-${i}`}
                className="flex gap-3 items-start p-3 bg-card border border-border rounded-lg"
              >
                <span className="flex-shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap">
                  {trow.year}
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{trow.client}</div>
                  <div className="text-xs text-muted-foreground">{trow.content}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {tAbout('skillsSectionTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
                {tAbout('skillIndustrialNetTitle')}
              </h3>
              <ul className="space-y-1.5">
                {skillIndustrialNetItems.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                  />
                </svg>
                {tAbout('skillPlcTitle')}
              </h3>
              <ul className="space-y-1.5">
                {skillPlcItems.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                  />
                </svg>
                {tAbout('skillScadaTitle')}
              </h3>
              <ul className="space-y-1.5">
                {skillScadaItems.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {author.expertise && author.expertise.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {tAbout('expertiseTagsHeading')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {author.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {author.certifications && author.certifications.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {tAbout('certificationsHeading')}
            </h2>
            <ul className="space-y-3">
              {author.certifications.map((cert, index) => (
                <li key={index} className="flex items-start gap-3 text-foreground/90">
                  <svg
                    className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-lg">{cert}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">{tAbout('contactHeading')}</h2>
          <div className="flex flex-wrap gap-4">
            {author.socialLinks.email && (
              <a
                href={`mailto:${author.socialLinks.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-foreground font-medium">{tCommon('email')}</span>
              </a>
            )}
            {author.socialLinks.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-foreground font-medium">{tCommon('linkedIn')}</span>
              </a>
            )}
            {author.socialLinks.github && (
              <a
                href={author.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-foreground font-medium">{tCommon('gitHub')}</span>
              </a>
            )}
            {author.socialLinks.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-foreground font-medium">{tCommon('twitter')}</span>
              </a>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
