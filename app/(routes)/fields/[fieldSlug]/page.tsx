import { notFound, redirect } from 'next/navigation';
import { contentRepository } from '@/lib/data/factory';
import { categoryHref } from '@/lib/utils/routes';

interface FieldPageProps {
  params: Promise<{ fieldSlug: string }>;
}

export async function generateStaticParams() {
  const fields = await contentRepository.getFields();
  return fields.map((field) => ({ fieldSlug: field.slug }));
}

export async function generateMetadata({ params }: FieldPageProps) {
  const { fieldSlug } = await params;
  const field = await contentRepository.getFieldBySlug(fieldSlug);
  if (!field) {
    return { title: 'Không tìm thấy' };
  }
  return {
    title: `${field.name} | Automation Blog`,
    description: `Danh mục và bài viết: ${field.name}`,
  };
}

/**
 * Field index: redirect to the first category so /fields/[slug] is a valid entry point.
 */
export default async function FieldPage({ params }: FieldPageProps) {
  const { fieldSlug } = await params;
  const field = await contentRepository.getFieldBySlug(fieldSlug);
  if (!field) {
    notFound();
  }

  const categories = await contentRepository.getCategoriesByFieldId(field.id);
  const first = categories[0];
  if (!first) {
    notFound();
  }

  redirect(categoryHref(field.slug, first.slug));
}
