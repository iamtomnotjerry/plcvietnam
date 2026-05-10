/**
 * FieldsSection Component
 * Display all fields with post counts
 * Validates Requirements: 11.4
 */

'use client';

import { useTranslations } from 'next-intl';
import { Folder, FolderTree } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Field } from '@/lib/types/domain';
import { fieldHref } from '@/lib/utils/routes';
import { HomeSectionHeader } from './HomeSectionHeader';

export interface FieldsSectionProps {
  fields: Field[];
}

/**
 * FieldsSection Component
 *
 * Displays:
 * - Section heading: "Lĩnh vực"
 * - Grid of field cards showing name, icon, and post count
 * - Click navigates to field page
 */
export function FieldsSection({ fields }: FieldsSectionProps) {
  const t = useTranslations('home');
  if (fields.length === 0) {
    return null;
  }

  return (
    <section className="section-surface-glass-primary py-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent)] opacity-90 motion-reduce:opacity-100"
        aria-hidden
      />
      <div className="editorial-container relative">
        <HomeSectionHeader
          eyebrow={t('fieldsEyebrow')}
          title={t('fieldsHeading')}
          subtitle={t('fieldsSub')}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => {
            // Navigate to field page
            const fieldUrl = fieldHref(field.slug);

            return (
              <Link
                key={field.id}
                href={fieldUrl}
                className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-6 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/10 dark:bg-card/80 dark:ring-white/[0.06]"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-70"
                  aria-hidden
                />
                <div className="relative">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10 transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-primary/[0.18]">
                    <FolderTree className="h-8 w-8" strokeWidth={2} aria-hidden />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-card-foreground transition-colors duration-200 group-hover:text-primary">
                    {field.name}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {field.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Folder
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{t('categoriesCount', { count: field.postCount })}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
