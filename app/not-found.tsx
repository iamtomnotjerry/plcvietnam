/**
 * Custom 404 Not Found Page (root — no locale segment)
 * Uses default locale copy; prefer /[locale]/... routes for full i18n.
 */

import Link from 'next/link';
import { Metadata } from 'next';
import viMessages from '@/messages/vi.json';

const e = viMessages.errors;
const site = viMessages.site;

export const metadata: Metadata = {
  title: `${e.notFoundTitle} - ${site.brand}`,
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-8xl font-bold text-primary">404</p>
          <h1 className="text-2xl font-semibold text-foreground">{e.notFoundTitle}</h1>
          <p className="text-muted-foreground">{e.notFoundBody}</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          {e.backHome}
        </Link>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-2">{e.searchPrompt}</p>
          <form action="/search" method="get" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder={e.searchPlaceholder}
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              {e.searchSubmit}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
