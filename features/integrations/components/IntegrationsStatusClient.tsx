'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetchJson } from '@/lib/admin/admin-fetch';
import { useLocale, useTranslations } from 'next-intl';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { IntegrationServiceBrandIcon } from '@/features/integrations/components/IntegrationServiceBrandIcon';
import { INTEGRATION_DASHBOARD_URLS } from '@/features/integrations/integration-dashboard-links';
import type {
  IntegrationHealthReport,
  IntegrationStatusItem,
  IntegrationStatusLevel,
} from '@/lib/integrations/types';

const SERVICE_ORDER = [
  'supabase',
  'upstash',
  'turnstile',
  'google_oauth',
  'hosting',
  'checklog_edge',
] as const;

function levelIcon(level: IntegrationStatusLevel) {
  switch (level) {
    case 'ok':
      return CheckCircle2;
    case 'warn':
      return AlertTriangle;
    case 'error':
      return XCircle;
    default:
      return HelpCircle;
  }
}

function levelCardClass(level: IntegrationStatusLevel): string {
  switch (level) {
    case 'ok':
      return 'border-emerald-500/25 bg-emerald-500/[0.06]';
    case 'warn':
      return 'border-amber-500/25 bg-amber-500/[0.07]';
    case 'error':
      return 'border-destructive/30 bg-destructive/[0.06]';
    default:
      return 'border-border/80 bg-muted/20';
  }
}

export function IntegrationsStatusClient() {
  const t = useTranslations('integrations');
  const locale = useLocale();
  const [data, setData] = useState<IntegrationHealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const report = await adminFetchJson<IntegrationHealthReport>(
        '/api/admin/integrations-status'
      );
      setData(report);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('loadError'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const itemsById = new Map(data?.items.map((i) => [i.id, i]) ?? []);
  const ordered: IntegrationStatusItem[] = data
    ? SERVICE_ORDER.map((id) => itemsById.get(id) as IntegrationStatusItem)
    : [];

  const checkedLabel = data?.checkedAt
    ? new Date(data.checkedAt).toLocaleString(locale === 'en' ? 'en' : 'vi', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  return (
    <div className="space-y-6 sm:space-y-10">
      <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.05] px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-start md:gap-5">
            <div
              className="order-2 hidden shrink-0 grid-cols-3 gap-1.5 rounded-2xl border border-primary/20 bg-primary/[0.07] p-2 shadow-inner dark:bg-primary/10 md:order-1 md:grid"
              aria-hidden
            >
              {SERVICE_ORDER.map((id) => (
                <IntegrationServiceBrandIcon
                  key={id}
                  serviceId={id}
                  isVercelHosting={id === 'hosting' ? Boolean(data?.vercel) : false}
                  variant="compact"
                />
              ))}
            </div>

            <div className="order-1 min-w-0 md:order-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
                {t('badge')}
              </p>
              <h1 className="mt-1 text-pretty text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>

            <div className="order-3 md:hidden">
              <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                {t('servicesStripLabel')}
              </p>
              <div className="-mx-1 px-1">
                <div
                  className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-hidden
                >
                  {SERVICE_ORDER.map((id) => (
                    <IntegrationServiceBrandIcon
                      key={`strip-${id}`}
                      serviceId={id}
                      isVercelHosting={id === 'hosting' ? Boolean(data?.vercel) : false}
                      variant="compact"
                      className="snap-start shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted/60 disabled:opacity-50 md:h-10 md:w-auto md:justify-center"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
            {t('refresh')}
          </button>
        </div>
        <p className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{t('lastCheck', { time: checkedLabel })}</span>
          {data ? (
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[0.65rem] text-foreground/80">
              {t('envLabel', { env: data.nodeEnv })}
            </span>
          ) : null}
        </p>
      </header>

      <section className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold text-foreground">{t('howToReadTitle')}</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
          <li>{t('howToRead1')}</li>
          <li>{t('howToRead2')}</li>
          <li>{t('howToRead3')}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold text-foreground">{t('usageSectionTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t('usageSectionBody')}
        </p>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {ordered.map((item) => {
            const Icon = levelIcon(item.level);
            const dash = INTEGRATION_DASHBOARD_URLS[item.id];
            return (
              <article
                key={item.id}
                className={`flex flex-col rounded-2xl border p-4 shadow-sm sm:p-5 ${levelCardClass(item.level)}`}
              >
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <IntegrationServiceBrandIcon
                    serviceId={item.id}
                    isVercelHosting={item.id === 'hosting' ? Boolean(data?.vercel) : false}
                  />
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <h3 className="text-pretty text-base font-semibold text-foreground sm:text-lg">
                        {t(`services.${item.id}.name`)}
                      </h3>
                      <Icon
                        className={`h-7 w-7 shrink-0 sm:mt-0.5 ${
                          item.level === 'ok'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.level === 'warn'
                              ? 'text-amber-600 dark:text-amber-400'
                              : item.level === 'error'
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                        }`}
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {t(`services.${item.id}.plain`)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('statusLine')}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {t(`levels.${item.level}.title`)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(`levels.${item.level}.hint`)}
                </p>

                {item.liveCheck ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.liveOk === true
                      ? t('liveProbeOk')
                      : item.liveOk === false
                        ? t('liveProbeFail')
                        : t('liveProbeSkipped')}
                  </p>
                ) : null}

                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {item.detailCodes.map((code) => (
                    <li key={code} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{t(`details.${item.id}.${code}` as never)}</span>
                    </li>
                  ))}
                </ul>

                {item.id === 'checklog_edge' ? (
                  <Link
                    href="/checklog"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {t('openChecklog')}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                ) : dash ? (
                  <a
                    href={dash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {t('openDashboard')}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
