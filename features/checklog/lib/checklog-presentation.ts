import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowUpDown,
  ClipboardList,
  FolderTree,
  Globe,
  ImageUp,
  KeyRound,
  Library,
  LogOut,
  MessageSquare,
  PenLine,
  Shield,
  Tags,
  UserPen,
  Users,
  Zap,
} from 'lucide-react';

export type ChecklogCategoryTab = 'all' | 'http' | 'security' | 'content' | 'admin';

export function categoryFilterFromTab(tab: ChecklogCategoryTab): string | undefined {
  if (tab === 'all') return undefined;
  return tab;
}

export function outcomeBadgeClasses(outcome: string | null | undefined): string {
  const o = (outcome ?? '').toLowerCase();
  if (o === 'success' || o === 'requested' || o === 'info')
    return 'border border-emerald-500/30 bg-emerald-500/12 text-emerald-800 dark:text-emerald-300';
  if (o === 'failure') return 'border border-destructive/35 bg-destructive/12 text-destructive';
  if (o === 'rate_limited')
    return 'border border-amber-500/35 bg-amber-500/12 text-amber-900 dark:text-amber-300';
  if (o === 'input_invalid')
    return 'border border-orange-500/35 bg-orange-500/10 text-orange-900 dark:text-orange-300';
  return 'border border-border bg-muted/50 text-muted-foreground';
}

export function sourceBadgeClasses(source: string): string {
  if (source === 'edge')
    return 'border border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-300';
  if (source === 'server')
    return 'border border-violet-500/30 bg-violet-500/10 text-violet-900 dark:text-violet-300';
  return 'border border-border bg-muted/40 text-muted-foreground';
}

export function categoryBadgeClasses(category: string): string {
  const c = category.toLowerCase();
  if (c === 'http')
    return 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-900 dark:text-cyan-300';
  if (c === 'security')
    return 'border border-rose-500/25 bg-rose-500/10 text-rose-900 dark:text-rose-300';
  if (c === 'content')
    return 'border border-teal-500/30 bg-teal-500/10 text-teal-900 dark:text-teal-300';
  if (c === 'admin')
    return 'border border-indigo-500/30 bg-indigo-500/10 text-indigo-900 dark:text-indigo-300';
  return 'border border-border bg-muted/40 text-muted-foreground';
}

export function iconForChannel(channel: string): LucideIcon {
  const ch = channel.toLowerCase();
  if (ch.includes('comment')) return MessageSquare;
  if (ch.startsWith('categories.')) return FolderTree;
  if (ch.startsWith('tags.')) return Tags;
  if (ch.startsWith('books.')) return Library;
  if (ch.startsWith('author.')) return UserPen;
  if (ch.startsWith('navigation.')) return ArrowUpDown;
  if (ch.startsWith('media.')) return ImageUp;
  if (ch.startsWith('users.')) return Users;
  if (ch.includes('signout') || ch.includes('oauth_callback')) return LogOut;
  if (
    ch.includes('signin') ||
    ch.includes('signup') ||
    ch.includes('password') ||
    ch.includes('reset') ||
    ch.includes('forgot') ||
    ch.includes('resend')
  )
    return KeyRound;
  if (ch === 'mutation') return Zap;
  if (ch.startsWith('fields.')) return Tags;
  if (ch.startsWith('posts.')) return PenLine;
  if (ch.startsWith('auth.') || ch.startsWith('session.')) return Shield;
  return Activity;
}

export function iconForCategory(category: string): LucideIcon {
  const c = category.toLowerCase();
  if (c === 'http') return Globe;
  if (c === 'security') return Shield;
  if (c === 'content') return MessageSquare;
  if (c === 'admin') return ClipboardList;
  return Activity;
}
