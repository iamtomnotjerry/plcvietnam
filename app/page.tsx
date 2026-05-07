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
import { generateWebSiteSchema, renderJsonLd } from '@/lib/utils/structuredData';
import { ErrorRetryButton } from '@/components/ui/ErrorRetryButton';

export const revalidate = 900;

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
  try {
    // Fetch data in parallel for optimal performance
    const [recentPosts, fieldsWithFirstCategory, featuredBooks] = await Promise.all([
      contentRepository.getRecentPosts(6),
      contentRepository.getFieldsWithFirstCategory(), // ✅ Optimized: 1 query instead of N+1
      contentRepository.getFeaturedBooks(3),
    ]);

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
          title="PLC Việt Nam"
          tagline="Cộng đồng kỹ sư tự động hóa Việt Nam"
          description="Khám phá kiến thức chuyên sâu về PLC, SCADA, Siemens TIA Portal và các công nghệ tự động hóa công nghiệp hiện đại. Chia sẻ kinh nghiệm thực tế từ các dự án triển khai tại Việt Nam."
        />

        {/* Recent Posts Section */}
        <RecentPostsSection posts={recentPosts} />

        {/* Empty state when no content yet */}
        {recentPosts.length === 0 && fieldsWithFirstCategory.length === 0 && (
          <section className="py-24 bg-background">
            <div className="container mx-auto px-4 max-w-2xl text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Chưa có nội dung</h2>
              <p className="text-muted-foreground">
                Blog đang được xây dựng. Hãy quay lại sau để xem các bài viết mới nhất!
              </p>
            </div>
          </section>
        )}

        {/* Fields Section */}
        <FieldsSection fields={fieldsWithFirstCategory} />

        {/* Featured Books Section */}
        <FeaturedBooksSection books={featuredBooks} />
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Không thể tải trang chủ</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'}
          </p>
          <ErrorRetryButton />
        </div>
      </main>
    );
  }
}
