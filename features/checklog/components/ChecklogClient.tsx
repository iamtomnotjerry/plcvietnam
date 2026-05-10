'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Download,
  Globe,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  PanelRightClose,
  Search,
  Shield,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useSupabaseAuth } from '@/features/comments/hooks/useSupabaseAuth';
import { Input } from '@/components/ui/Input';
import {
  makeChannelHumanLookup,
  humanCategoryLabel,
  humanOutcomeLabel,
  humanSourceLabel,
} from '@/features/checklog/lib/checklog-human-labels';
import {
  categoryBadgeClasses,
  categoryFilterFromTab,
  iconForCategory,
  iconForChannel,
  outcomeBadgeClasses,
  sourceBadgeClasses,
  type ChecklogCategoryTab,
} from '@/features/checklog/lib/checklog-presentation';

type ActorDisplay = { full_name: string | null; email: string };

type ChecklogRow = {
  id: string;
  created_at: string;
  category: string;
  channel: string;
  source: string;
  http_method: string | null;
  path: string | null;
  outcome: string | null;
  ip: string | null;
  actor_user_id: string | null;
  request_id: string | null;
  metadata: Record<string, unknown>;
  actor_display?: ActorDisplay | null;
};

type Stats = {
  total: number;
  byCategory: { http: number; security: number; content: number; admin: number; other: number };
};

function useRelativeTime(locale: string) {
  return useMemo(() => {
    const loc = locale === 'en' ? 'en' : 'vi';
    return (iso: string) => {
      const then = new Date(iso).getTime();
      const diffSec = Math.floor((Date.now() - then) / 1000);
      if (diffSec < 10) return loc === 'en' ? 'just now' : 'vừa xong';
      const rtf = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' });
      if (diffSec < 60) return rtf.format(-diffSec, 'second');
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return rtf.format(-diffMin, 'minute');
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return rtf.format(-diffHr, 'hour');
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay < 30) return rtf.format(-diffDay, 'day');
      return new Date(iso).toLocaleString(loc);
    };
  }, [locale]);
}

function maskEmail(email: string): string {
  const [u, d] = email.split('@');
  if (!d) return email;
  if (u.length <= 2) return `${u}***@${d}`;
  return `${u.slice(0, 2)}•••@${d}`;
}

function isoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const OUTCOME_FILTER_VALUES = [
  'success',
  'failure',
  'rate_limited',
  'input_invalid',
  'requested',
  'info',
] as const;

const TABS: { id: ChecklogCategoryTab; icon: LucideIcon }[] = [
  { id: 'all', icon: ClipboardList },
  { id: 'http', icon: Globe },
  { id: 'security', icon: Shield },
  { id: 'content', icon: MessageSquare },
  { id: 'admin', icon: LayoutDashboard },
];

export function ChecklogClient() {
  const t = useTranslations('checklog');
  const locale = useLocale();
  const rel = useRelativeTime(locale);
  const { user, status: authStatus } = useSupabaseAuth();

  const [items, setItems] = useState<ChecklogRow[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ChecklogCategoryTab>('all');
  const [channelInput, setChannelInput] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [appliedChannel, setAppliedChannel] = useState('');
  const [appliedPathPrefix, setAppliedPathPrefix] = useState('');
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [appliedOutcome, setAppliedOutcome] = useState('');
  const [actorMineInput, setActorMineInput] = useState(false);
  const [appliedActorMine, setAppliedActorMine] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [selected, setSelected] = useState<ChecklogRow | null>(null);
  const limit = 40;

  const categoryParam = categoryFilterFromTab(tab);
  const channelHuman = useMemo(() => makeChannelHumanLookup(t), [t]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedDateFrom) params.set('from', appliedDateFrom);
      if (appliedDateTo) params.set('to', appliedDateTo);
      const qs = params.toString();
      const res = await fetch(`/api/admin/checklog/stats${qs ? `?${qs}` : ''}`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = (await res.json()) as Stats;
      setStats(data);
    } finally {
      setStatsLoading(false);
    }
  }, [appliedDateFrom, appliedDateTo]);

  const load = useCallback(
    async (overrideOffset?: number) => {
      const o = overrideOffset !== undefined ? overrideOffset : offset;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: String(limit), offset: String(o) });
        if (categoryParam) params.set('category', categoryParam);
        const ch = appliedChannel.trim();
        const pp = appliedPathPrefix.trim();
        if (ch) params.set('channelSearch', ch);
        if (pp) params.set('pathPrefix', pp);
        if (appliedDateFrom) params.set('from', appliedDateFrom);
        if (appliedDateTo) params.set('to', appliedDateTo);
        if (appliedOutcome) params.set('outcome', appliedOutcome);
        if (appliedActorMine && user?.id) params.set('actorUserId', user.id);
        const res = await fetch(`/api/admin/checklog?${params}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg = data?.error?.message ?? t('loadError');
          throw new Error(msg);
        }
        const data = (await res.json()) as { items: ChecklogRow[]; count: number };
        setItems(data.items);
        setCount(data.count);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('loadError'));
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [
      offset,
      categoryParam,
      appliedChannel,
      appliedPathPrefix,
      appliedDateFrom,
      appliedDateTo,
      appliedOutcome,
      appliedActorMine,
      user?.id,
      t,
      limit,
    ]
  );

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const viewerName = useMemo(() => {
    if (!user) return '';
    const meta = user.user_metadata ?? {};
    return (
      (typeof meta.full_name === 'string' && meta.full_name) ||
      (typeof meta.name === 'string' && meta.name) ||
      user.email ||
      ''
    );
  }, [user]);

  const onTabChange = (next: ChecklogCategoryTab) => {
    setTab(next);
    setOffset(0);
    setSelected(null);
  };

  const refreshAll = () => {
    setAppliedChannel(channelInput);
    setAppliedPathPrefix(pathInput);
    setAppliedDateFrom(dateFromInput);
    setAppliedDateTo(dateToInput);
    setAppliedOutcome(outcomeInput);
    setAppliedActorMine(actorMineInput);
    setOffset(0);
  };

  const clearAllFilters = () => {
    setChannelInput('');
    setPathInput('');
    setDateFromInput('');
    setDateToInput('');
    setAppliedChannel('');
    setAppliedPathPrefix('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setOutcomeInput('');
    setAppliedOutcome('');
    setActorMineInput(false);
    setAppliedActorMine(false);
    setOffset(0);
    setSelected(null);
  };

  const applyPresetRange = (from: string, to: string) => {
    setDateFromInput(from);
    setDateToInput(to);
    setAppliedDateFrom(from);
    setAppliedDateTo(to);
    setOffset(0);
  };

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setCopyFeedback(false);
    }
  }, []);

  const exportCurrentPageJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      page: { offset, limit, count },
      items,
    };
    downloadBlob(
      `checklog-page-${pageNum}.json`,
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    );
  };

  const exportCurrentPageCsv = () => {
    const headers = [
      'id',
      'created_at',
      'category',
      'channel',
      'outcome',
      'source',
      'path',
      'http_method',
      'actor_user_id',
      'ip',
    ];
    const esc = (v: string | null | undefined) => {
      const s = v ?? '';
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [
      headers.join(','),
      ...items.map((r) =>
        [
          r.id,
          r.created_at,
          r.category,
          r.channel,
          r.outcome ?? '',
          r.source,
          r.path ?? '',
          r.http_method ?? '',
          r.actor_user_id ?? '',
          r.ip ?? '',
        ]
          .map((c) => esc(String(c)))
          .join(',')
      ),
    ];
    downloadBlob(
      `checklog-page-${pageNum}.csv`,
      new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    );
  };

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const pageNum = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(count / limit));

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.06] px-6 py-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/[0.12] blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-inner shadow-primary/10">
              <ShieldCheck className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
                {t('badge')}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
          </div>

          {authStatus === 'authenticated' && user ? (
            <div className="flex w-full flex-col gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-3 backdrop-blur-sm md:max-w-sm">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('viewerLabel')}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {viewerName
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{viewerName || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email ? maskEmail(user.email) : '—'}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                  {t('viewerRole')}
                </span>
              </div>
            </div>
          ) : null}
        </div>
        <p className="relative mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2 text-xs text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          <span>{t('securityNotice')}</span>
        </p>
      </header>

      <details className="rounded-2xl border border-border/70 bg-muted/10 px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
          {t('guideTitle')}
        </summary>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>{t('guideIntro')}</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('guideHttpTitle')}</h3>
              <p>{t('guideHttpBody')}</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('guideSecurityTitle')}</h3>
              <p>{t('guideSecurityBody')}</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('guideContentTitle')}</h3>
              <p>{t('guideContentBody')}</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('guideAdminTitle')}</h3>
              <p>{t('guideAdminBody')}</p>
            </div>
          </div>
        </div>
      </details>

      <section className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {!appliedDateFrom && !appliedDateTo ? t('statsHintAll') : t('statsHintRange')}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            {
              key: 'total',
              value: stats?.total ?? 0,
              label: t('statTotal'),
              icon: Activity,
              className: 'from-slate-500/10 to-transparent border-slate-500/20',
            },
            {
              key: 'http',
              value: stats?.byCategory.http ?? 0,
              label: t('statHttp'),
              icon: Globe,
              className: 'from-cyan-500/12 to-transparent border-cyan-500/25',
            },
            {
              key: 'security',
              value: stats?.byCategory.security ?? 0,
              label: t('statSecurity'),
              icon: Shield,
              className: 'from-rose-500/10 to-transparent border-rose-500/25',
            },
            {
              key: 'content',
              value: stats?.byCategory.content ?? 0,
              label: t('statContent'),
              icon: MessageSquare,
              className: 'from-teal-500/10 to-transparent border-teal-500/25',
            },
            {
              key: 'admin',
              value: stats?.byCategory.admin ?? 0,
              label: t('statAdmin'),
              icon: LayoutDashboard,
              className: 'from-indigo-500/12 to-transparent border-indigo-500/25',
            },
          ].map((card) => (
            <div
              key={card.key}
              className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 ${card.className}`}
            >
              <div className="flex items-center justify-between gap-2">
                <card.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                {statsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                ) : null}
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
                {statsLoading ? '—' : card.value.toLocaleString(locale === 'en' ? 'en' : 'vi')}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{card.label}</p>
              {card.key === 'total' && !statsLoading && stats && stats.byCategory.other > 0 ? (
                <p className="mt-2 text-[0.7rem] text-muted-foreground">
                  {t('statOther', { count: stats.byCategory.other })}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <nav
          className="flex flex-wrap gap-2 rounded-xl border border-border/80 bg-muted/20 p-1.5"
          aria-label={t('categoryNavAria')}
        >
          {TABS.map(({ id, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {t(`cat.${id}`)}
              </button>
            );
          })}
        </nav>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-border/60 bg-muted/10 p-4 lg:max-w-3xl">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="cl-df"
              >
                {t('dateFrom')}
              </label>
              <Input
                id="cl-df"
                type="date"
                value={dateFromInput}
                onChange={(e) => setDateFromInput(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="cl-dt"
              >
                {t('dateTo')}
              </label>
              <Input
                id="cl-dt"
                type="date"
                value={dateToInput}
                onChange={(e) => setDateToInput(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPresetRange(isoDateLocal(new Date()), isoDateLocal(new Date()))}
              className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/60"
            >
              {t('presetToday')}
            </button>
            <button
              type="button"
              onClick={() =>
                applyPresetRange(
                  isoDateLocal(new Date(Date.now() - 7 * 86400000)),
                  isoDateLocal(new Date())
                )
              }
              className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/60"
            >
              {t('preset7d')}
            </button>
            <button
              type="button"
              onClick={() =>
                applyPresetRange(
                  isoDateLocal(new Date(Date.now() - 30 * 86400000)),
                  isoDateLocal(new Date())
                )
              }
              className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/60"
            >
              {t('preset30d')}
            </button>
            <button
              type="button"
              onClick={() => applyPresetRange('', '')}
              className="inline-flex h-8 items-center rounded-md border border-dashed border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted/60"
            >
              {t('presetClearDates')}
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[11rem]">
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="cl-out"
              >
                {t('filterOutcome')}
              </label>
              <select
                id="cl-out"
                value={outcomeInput}
                onChange={(e) => setOutcomeInput(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t('filterOutcomeAll')}</option>
                {OUTCOME_FILTER_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {humanOutcomeLabel(v, t)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={actorMineInput}
                onChange={(e) => setActorMineInput(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              {t('filterActorMine')}
            </label>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mb-0.5 inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/60"
            >
              {t('clearFilters')}
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1 sm:min-w-[12rem]">
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="cl-ch"
              >
                {t('searchChannel')}
              </label>
              <Input
                id="cl-ch"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder={t('searchChannelPh')}
                className="h-9"
              />
            </div>
            <div className="min-w-[10rem] flex-1 sm:min-w-[12rem]">
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="cl-path"
              >
                {t('searchPath')}
              </label>
              <Input
                id="cl-path"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                placeholder={t('searchPathPh')}
                className="h-9"
              />
            </div>
            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-4 w-4" aria-hidden />
              {t('refresh')}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t('loading')}
            </span>
          ) : items.length === 0 ? (
            t('rangeEmpty', { total: count })
          ) : (
            t('rangeSummary', {
              from: offset + 1,
              to: Math.min(offset + items.length, count),
              total: count,
            })
          )}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loading || items.length === 0}
            onClick={exportCurrentPageJson}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted/60 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('exportJson')}
          </button>
          <button
            type="button"
            disabled={loading || items.length === 0}
            onClick={exportCurrentPageCsv}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted/60 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('exportCsv')}
          </button>
          <span className="text-xs text-muted-foreground sm:ml-1">
            {t('pageOf', { page: pageNum, pages: totalPages })}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('colWhatHappened')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('colTime')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('colCategory')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('colSource')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('colRequest')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('colActor')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('colOutcome')}
                </th>
                <th className="w-10 px-2 py-3" aria-hidden />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {items.map((row) => {
                const ChIcon = iconForChannel(row.channel);
                const CatIcon = iconForCategory(row.category);
                const ch = channelHuman(row.channel);
                const actorLabel =
                  row.actor_display?.full_name?.trim() ||
                  (row.actor_display?.email ? maskEmail(row.actor_display.email) : null) ||
                  (row.actor_user_id ? `${row.actor_user_id.slice(0, 8)}…` : null);
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => setSelected(row)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground">
                          <ChIcon className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-medium leading-snug text-foreground">
                            {ch.title}
                          </p>
                          <p className="text-xs leading-snug text-muted-foreground">
                            {ch.subtitle}
                          </p>
                          <p className="font-mono text-[0.65rem] text-muted-foreground/85">
                            {t('techChannelLabel', { channel: row.channel })}
                          </p>
                          <p className="truncate font-mono text-[0.65rem] text-muted-foreground/70">
                            {row.http_method && row.path
                              ? `${row.http_method} ${row.path}`
                              : (row.path ?? '—')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className="text-xs font-medium text-foreground"
                        title={new Date(row.created_at).toLocaleString()}
                      >
                        {rel(row.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${categoryBadgeClasses(row.category)}`}
                      >
                        <CatIcon className="h-3 w-3" aria-hidden />
                        {humanCategoryLabel(row.category, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${sourceBadgeClasses(row.source)}`}
                      >
                        {humanSourceLabel(row.source, t)}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <p
                        className="truncate font-mono text-[0.7rem] text-muted-foreground"
                        title={row.ip ?? ''}
                      >
                        {row.ip ?? '—'}
                      </p>
                    </td>
                    <td className="max-w-[140px] px-4 py-3">
                      <p className="truncate text-xs text-foreground" title={actorLabel ?? ''}>
                        {actorLabel ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {row.outcome ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${outcomeBadgeClasses(row.outcome)}`}
                        >
                          {humanOutcomeLabel(row.outcome, t)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      <PanelRightClose className="h-4 w-4 opacity-50" aria-hidden />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && !loading && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t('empty')}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t('emptyHint')}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={offset === 0 || loading}
          onClick={() => setOffset((o) => Math.max(0, o - limit))}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t('prev')}
        </button>
        <button
          type="button"
          disabled={offset + limit >= count || loading}
          onClick={() => setOffset((o) => o + limit)}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/50 disabled:opacity-40"
        >
          {t('next')}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {selected ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
            aria-label={t('detailClose')}
            onClick={() => setSelected(null)}
          />
          <aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal
            aria-labelledby="checklog-detail-title"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <h2
                id="checklog-detail-title"
                className="min-w-0 text-sm font-semibold text-foreground"
              >
                {t('detailTitle')}
              </h2>
              <div className="flex shrink-0 items-center gap-1">
                {copyFeedback ? (
                  <span className="px-2 text-[0.65rem] font-medium text-emerald-600 dark:text-emerald-400">
                    {t('copied')}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copyToClipboard(selected.id);
                  }}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title={t('copyId')}
                >
                  <span className="sr-only">{t('copyId')}</span>
                  <Copy className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copyToClipboard(JSON.stringify(selected, null, 2));
                  }}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title={t('copyRowJson')}
                >
                  <span className="sr-only">{t('copyRowJson')}</span>
                  <ClipboardList className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t('detailClose')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">
              <div className="mb-5 space-y-2 rounded-xl border border-border/80 bg-muted/20 p-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('detailPlainSummary')}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {channelHuman(selected.channel).title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {channelHuman(selected.channel).subtitle}
                </p>
              </div>
              <dl className="space-y-3">
                {selected.actor_display ? (
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t('detailActorProfile')}
                    </dt>
                    <dd className="mt-1 text-xs">
                      {selected.actor_display.full_name ?? '—'}
                      <br />
                      <span className="text-muted-foreground">
                        {maskEmail(selected.actor_display.email)}
                      </span>
                    </dd>
                  </div>
                ) : null}
              </dl>
              <details className="mt-5 rounded-lg border border-border/80 bg-background/50">
                <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-foreground">
                  {t('detailTechnical')}
                </summary>
                <dl className="space-y-3 border-t border-border/60 px-3 py-3">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">{t('colChannel')}</dt>
                    <dd className="mt-1 font-mono text-xs break-all">{selected.channel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t('detailRequestId')}
                    </dt>
                    <dd className="mt-1 font-mono text-xs break-all">
                      {selected.request_id ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t('detailActorId')}
                    </dt>
                    <dd className="mt-1 font-mono text-xs break-all">
                      {selected.actor_user_id ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t('detailTechnicalMeta')}
                    </dt>
                    <dd className="mt-2 overflow-x-auto rounded-lg border border-border bg-muted/30 p-3">
                      <pre className="whitespace-pre-wrap break-all font-mono text-[0.7rem] leading-relaxed text-foreground">
                        {JSON.stringify(selected.metadata ?? {}, null, 2)}
                      </pre>
                    </dd>
                  </div>
                </dl>
              </details>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
