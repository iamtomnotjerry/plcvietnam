/**
 * FieldsSection Component
 * Display all fields with post counts
 * Validates Requirements: 11.4
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Field } from '@/lib/types/domain';
import { fieldHref } from '@/lib/utils/routes';

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

  /**
   * Get icon component for field
   * Default to folder icon if no icon specified
   */
  const getFieldIcon = () => {
    // Default folder icon for fields
    return (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    );
  };

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('fieldsHeading')}</h2>
          <p className="text-muted-foreground mt-2">{t('fieldsSub')}</p>
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => {
            // Navigate to field page
            const fieldUrl = fieldHref(field.slug);

            return (
              <Link
                key={field.id}
                href={fieldUrl}
                className="group block bg-card border border-border rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4 text-primary group-hover:bg-primary/20 transition-colors duration-200">
                  {getFieldIcon()}
                </div>

                {/* Field Name */}
                <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {field.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {field.description}
                </p>

                {/* Category Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{t('categoriesCount', { count: field.postCount })}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
