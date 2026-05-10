import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArchitecturePageClient } from '@/features/architecture/components/ArchitecturePageClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('architecture');
  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  };
}

export default function ArchitecturePage() {
  return (
    <div className="mx-auto w-full max-w-[min(96rem,calc(100%-2rem))] px-4 py-6 sm:max-w-[min(96rem,calc(100%-2.5rem))] sm:px-5 sm:py-8">
      <ArchitecturePageClient />
    </div>
  );
}
