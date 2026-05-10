import type { useTranslations } from 'next-intl';

type ChecklogT = ReturnType<typeof useTranslations<'checklog'>>;

type ChannelRow = { title: string; subtitle: string };

export function makeChannelHumanLookup(t: ChecklogT): (channel: string) => ChannelRow {
  const pack = t.raw('human.channels') as Record<string, ChannelRow>;
  return (channel: string) => {
    const slug = channel.replace(/\./g, '_');
    const row = pack[slug];
    if (row) return row;
    return {
      title: t('human.channels._unknown.title', { channel }),
      subtitle: t('human.channels._unknown.subtitle'),
    };
  };
}

export function humanOutcomeLabel(outcome: string | null | undefined, t: ChecklogT): string {
  if (!outcome) return '—';
  const o = outcome.toLowerCase();
  const pack = t.raw('human.outcomes') as Record<string, string>;
  return pack[o] ?? outcome.replace(/_/g, ' ');
}

export function humanSourceLabel(source: string, t: ChecklogT): string {
  if (source === 'edge') return t('human.sources.edge');
  if (source === 'server') return t('human.sources.server');
  return source;
}

export function humanCategoryLabel(category: string, t: ChecklogT): string {
  const c = category.toLowerCase();
  if (c === 'http') return t('cat.http');
  if (c === 'security') return t('cat.security');
  if (c === 'content') return t('cat.content');
  if (c === 'admin') return t('cat.admin');
  return category;
}
