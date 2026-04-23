/**
 * Homepage Route
 * Assembles all homepage sections with data from contentRepository
 * Validates Requirements: 11.1, 11.6, 11.7
 */

import { contentRepository } from '@/lib/data/factory';
import {
  HeroSection,
  RecentPostsSection,
  FieldsSection,
  FeaturedBooksSection,
} from '@/features/homepage/components';
import type { Field } from '@/lib/types/domain';
import { generateWebSiteSchema, renderJsonLd } from '@/lib/utils/structuredData';

export const dynamic = 'force-dynamic';

/**
 * Extended Field type with first category slug for navigation
 */
interface FieldWithFirstCategory extends Field {
  firstCategorySlug?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automationblog.vn';

/**
 * Homepage - Server Component
 *
 * Fetches data and renders:
 * - HeroSection with blog title, tagline, description
 * - RecentPostsSection with 6 most recent posts
 * - FieldsSection with all fields and post counts
 * - FeaturedBooksSection with 3 featured books
 *
 * Navigation handlers:
 * - Post cards navigate to /fields/[fieldSlug]/[categorySlug]/[postSlug] (handled by PostCard)
 * - Field cards navigate to /fields/[fieldSlug]/[firstCategorySlug] (Requirement 11.7)
 */
export default async function HomePage() {
  // Fetch data in parallel for optimal performance
  const [recentPosts, fields, featuredBooks] = await Promise.all([
    contentRepository.getRecentPosts(6),
    contentRepository.getFields(),
    contentRepository.getFeaturedBooks(3),
  ]);

  // Fetch first category for each field to enable navigation (Requirement 11.7)
  const fieldsWithFirstCategory: FieldWithFirstCategory[] = await Promise.all(
    fields.map(async (field) => {
      const categories = await contentRepository.getCategoriesByFieldId(field.id);
      // Categories are sorted by order, so first one is the first category
      const firstCategory = categories[0];

      return {
        ...field,
        firstCategorySlug: firstCategory?.slug,
      };
    })
  );

  return (
    <main className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderJsonLd(generateWebSiteSchema(baseUrl)),
        }}
      />

      {/* Hero Section */}
      <HeroSection
        title="Automation Blog"
        tagline="Chia sẻ kiến thức tự động hóa công nghiệp"
        description="Khám phá kiến thức chuyên sâu về PLC, SCADA, Siemens Automation và các công nghệ tự động hóa công nghiệp hiện đại. Chia sẻ kinh nghiệm thực tế từ các dự án triển khai."
      />

      {/* Recent Posts Section */}
      <RecentPostsSection posts={recentPosts} />

      {/* Fields Section */}
      <FieldsSection fields={fieldsWithFirstCategory} />

      {/* Featured Books Section */}
      <FeaturedBooksSection books={featuredBooks} />
    </main>
  );
}
