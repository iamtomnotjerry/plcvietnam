/**
 * Single source for footer navigation — keeps markup DRY and consistent.
 */

export const FOOTER_EXPLORE_LINKS = [
  { href: '/', navKey: 'home' as const },
  { href: '/posts', navKey: 'posts' as const },
  { href: '/books', navKey: 'books' as const },
  { href: '/about', navKey: 'about' as const },
  { href: '/search', navKey: 'search' as const },
] as const;

export type FooterResourceItem =
  | { kind: 'external'; href: string; footerKey: 'rss' | 'sitemap' }
  | { kind: 'internal'; href: '/admin'; footerKey: 'admin' };

export const FOOTER_RESOURCE_LINKS: readonly FooterResourceItem[] = [
  { kind: 'external', href: '/rss.xml', footerKey: 'rss' },
  { kind: 'external', href: '/sitemap.xml', footerKey: 'sitemap' },
  { kind: 'internal', href: '/admin', footerKey: 'admin' },
] as const;

export type SocialKey = 'email' | 'linkedin' | 'github' | 'twitter';

export const FOOTER_SOCIAL: ReadonlyArray<{
  key: SocialKey;
  href: string;
  ariaKey: 'socialEmail' | 'socialLinkedIn' | 'socialGitHub' | 'socialX';
}> = [
  { key: 'email', href: 'mailto:contact@automationblog.vn', ariaKey: 'socialEmail' },
  { key: 'linkedin', href: 'https://linkedin.com', ariaKey: 'socialLinkedIn' },
  { key: 'github', href: 'https://github.com', ariaKey: 'socialGitHub' },
  { key: 'twitter', href: 'https://twitter.com', ariaKey: 'socialX' },
] as const;
