# Implementation Plan: Automation Blog

## Overview

This implementation plan breaks down the Automation Blog feature into discrete coding tasks following a bottom-up approach: Foundation → Core Features → Secondary Features → User Interaction → Polish → Testing. Each task builds incrementally, with checkpoints to ensure stability before proceeding.

The implementation uses Next.js 14+ with App Router, TypeScript (strict mode), Tailwind CSS, and a feature-based architecture with data abstraction layer supporting both mock data and Supabase providers.

---

## Tasks

### Phase 1: Foundation & Project Setup

- [x] 1. Initialize Next.js project with TypeScript and configure base dependencies
  - Create Next.js 14+ project with App Router and TypeScript strict mode
  - Install dependencies: Tailwind CSS, NextAuth.js, Vitest, fast-check, React Testing Library
  - Configure `tsconfig.json` with strict mode and path aliases (`@/`)
  - Set up Tailwind CSS with CSS variables for theming
  - Create `.env.example` with required environment variables
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 2. Create domain types and shared interfaces
  - Create `lib/types/domain.ts` with all domain entities: Field, Category, Post, Tag, Book, Author, Comment, SEOMetadata, SocialLinks, NavigationNode
  - Define TypeScript interfaces matching the design document data models
  - Export all types for use across features
  - _Requirements: 8.4, 7.7_

- [x] 3. Implement Content Repository interface and provider factory
  - Create `lib/data/repository.ts` with ContentRepository interface defining all data operations
  - Define query options interfaces: PostQueryOptions, BookQueryOptions, PaginatedResult, SearchResults, CreateCommentInput
  - Create `lib/data/factory.ts` with createContentRepository() factory function
  - Implement provider selection based on DATA_PROVIDER environment variable with mock as default
  - _Requirements: 7.1, 7.4, 7.5, 7.6, 7.8_

- [x] 4. Create mock data files and Mock Provider implementation
  - Create JSON files in `public/mock-data/`: fields.json, categories.json, posts.json, books.json, tags.json, authors.json
  - Populate with realistic Vietnamese content for industrial automation topics (PLC, SCADA, Siemens)
  - Implement `lib/data/providers/mock/index.ts` with MockProvider class
  - Implement all ContentRepository methods: getFields, getPosts, getPostBySlug, search, etc.
  - Establish relationships between entities (link categories to fields, posts to categories/tags)
  - _Requirements: 7.2, 7.8_

- [x] 5. Checkpoint - Verify data layer foundation
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Core Algorithms & Utilities

- [x] 6. Implement reading time calculation utility
  - [x] 6.1 Create `features/posts/utils/readingTime.ts` with calculateReadingTime function
    - Strip HTML tags from content
    - Normalize whitespace
    - Count words by splitting on whitespace
    - Calculate minutes as ceil(wordCount / 200) with minimum 1
    - _Requirements: 13.1, 13.2_

  - [x] 6.2 Write property test for reading time calculation
    - **Property 1: Reading Time Calculation Correctness**
    - **Validates: Requirements 13.2**
    - Generate random content strings (plain text, HTML, whitespace, empty)
    - Verify result equals ceil(wordCount / 200) with minimum 1
    - Test file: `features/posts/utils/__tests__/readingTime.property.test.ts`

- [x] 7. Implement table of contents generation utility
  - [x] 7.1 Create `features/posts/utils/contentParser.ts` with generateTableOfContents function
    - Parse HTML content to extract h2, h3, h4 headings
    - Return empty array if fewer than 3 headings
    - Build hierarchical TOCItem tree preserving heading levels
    - Ensure all headings have IDs for anchor links
    - _Requirements: 3.4_

  - [x] 7.2 Write property test for table of contents hierarchy
    - **Property 3: Table of Contents Hierarchy Preservation**
    - **Validates: Requirements 3.4**
    - Generate random HTML with varying heading structures
    - Verify TOC structure matches heading hierarchy
    - Verify threshold enforcement (only generated when ≥3 headings)
    - Test file: `features/posts/utils/__tests__/tableOfContents.property.test.ts`

- [x] 8. Implement related posts algorithm
  - [x] 8.1 Create `features/posts/hooks/useRelatedPosts.ts` with findRelatedPosts function
    - Score posts by number of shared tags (2 points per tag) + same category (1 point)
    - Sort by score descending, then by publication date descending
    - Fallback to recent posts from same category if no shared tags
    - Exclude current post and respect limit parameter
    - _Requirements: 12.4, 12.5_

  - [x] 8.2 Write property test for related posts algorithm
    - **Property 4: Related Posts Algorithm Correctness**
    - **Validates: Requirements 12.4, 12.5**
    - Generate random posts with random tag assignments and categories
    - Verify related posts share tags or same category
    - Verify current post is excluded and limit is respected
    - Test file: `features/posts/hooks/__tests__/relatedPosts.property.test.ts`

- [x] 9. Implement client-side search engine
  - [x] 9.1 Create `features/search/utils/searchEngine.ts` with searchContent function
    - Return empty results for queries < 2 characters
    - Filter posts by title, excerpt, category name, tag names (case-insensitive)
    - Filter books by title and description (case-insensitive)
    - Return SearchResults with posts, books, and totalResults count
    - _Requirements: 9.2, 9.3, 9.5, 9.6_

  - [x] 9.2 Write property test for search result correctness
    - **Property 5: Search Result Correctness**
    - **Validates: Requirements 9.3, 9.6**
    - Generate random search queries and content collections
    - Verify all results contain query substring in searchable fields
    - Verify results are subset of input collection
    - Test file: `features/search/utils/__tests__/searchEngine.property.test.ts`

- [x] 10. Checkpoint - Verify core algorithms
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Navigation & Content Browsing

- [x] 11. Implement Navigation Tree feature
  - [x] 11.1 Create navigation types and hooks
    - Create `features/navigation/types.ts` with NavigationTreeProps and NavigationNode interfaces
    - Create `features/navigation/hooks/useNavigationTree.ts` to fetch and transform navigation data
    - Implement localStorage persistence for expansion state
    - _Requirements: 1.1, 1.5_

  - [x] 11.2 Create NavigationNode component
    - Create `features/navigation/components/NavigationNode.tsx` for recursive tree rendering
    - Implement expand/collapse functionality with smooth transitions
    - Highlight active node based on current route
    - Handle click events for fields, categories, and posts
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 11.3 Create NavigationTree component
    - Create `features/navigation/components/NavigationTree.tsx` as main tree container
    - Implement search input for >10 fields
    - Integrate NavigationNode components recursively
    - _Requirements: 1.6_

  - [x] 11.4 Write unit tests for navigation components
    - Test expansion/collapse behavior
    - Test active node highlighting
    - Test search filtering
    - Test localStorage persistence

- [x] 12. Implement Post listing and detail pages
  - [x] 12.1 Create Post components
    - Create `features/posts/components/PostCard.tsx` with variants (default, compact, featured)
    - Display title (truncated to 2 lines), excerpt (max 200 chars), date, reading time, category, thumbnail
    - Create `features/posts/components/PostList.tsx` with pagination support
    - Create `features/posts/components/PostContent.tsx` for rendering post body with images and videos
    - _Requirements: 2.2, 3.1, 3.2, 3.3_

  - [x] 12.2 Create Post detail page components
    - Create `features/posts/components/PostDetail.tsx` as main post detail container
    - Create `features/posts/components/TableOfContents.tsx` using generateTableOfContents utility
    - Create `features/posts/components/RelatedPosts.tsx` using findRelatedPosts algorithm
    - Create `features/posts/components/SocialShare.tsx` with Facebook, LinkedIn, Twitter, copy link buttons
    - Display breadcrumb, title, author, date, reading time, view count, tags
    - _Requirements: 3.4, 3.5, 3.6, 12.1, 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 12.3 Create Post routes
    - Create `app/(routes)/fields/[fieldSlug]/[categorySlug]/page.tsx` for category listing
    - Create `app/(routes)/fields/[fieldSlug]/[categorySlug]/[postSlug]/page.tsx` for post detail
    - Implement generateStaticParams for static generation with mock provider
    - Implement view count increment on post page load
    - Handle 404 with notFound() for invalid slugs
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 8.6, 13.3, 13.4, 13.5_

  - [x] 12.4 Write unit tests for post components
    - Test PostCard rendering and navigation
    - Test PostDetail rendering with all sections
    - Test TableOfContents generation and anchor links
    - Test SocialShare button functionality

- [x] 13. Checkpoint - Verify navigation and post browsing
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Secondary Features (Tags, Books, About, Homepage)

- [x] 14. Implement Tags feature
  - [x] 14.1 Create Tag components
    - Create `features/tags/components/TagList.tsx` for displaying tag chips
    - Create `features/tags/hooks/useTagPosts.ts` for fetching posts by tag
    - _Requirements: 12.1, 12.2_

  - [x] 14.2 Create Tag page route
    - Create `app/(routes)/tags/[tagSlug]/page.tsx` for tag listing
    - Display tag name, post count, and paginated post list (20 per page)
    - _Requirements: 12.3_

  - [x] 14.3 Write unit tests for tag components
    - Test TagList rendering
    - Test tag page with pagination

- [x] 15. Implement Books feature
  - [x] 15.1 Create Book components
    - Create `features/books/components/BookCard.tsx` with grid and list variants
    - Display cover image, title, description (max 300 chars), author, series badge, download/external link
    - Create `features/books/components/BookList.tsx` with pagination and series grouping
    - Create `features/books/hooks/useBooks.ts` for fetching books
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 15.2 Create Books page route
    - Create `app/(routes)/books/page.tsx` for books listing
    - Implement pagination (12 books per page)
    - _Requirements: 5.1, 5.5_

  - [x] 15.3 Write unit tests for book components
    - Test BookCard rendering with different variants
    - Test BookList with pagination and series grouping

- [x] 16. Implement About page
  - Create `app/(routes)/about/page.tsx` for author information
  - Display author name, avatar, bio, expertise, certifications, social links
  - Implement contact link handling (open in new tab)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 17. Implement Homepage
  - [x] 17.1 Create Homepage components
    - Create `features/homepage/components/HeroSection.tsx` with title, tagline, description, CTA
    - Create `features/homepage/components/RecentPostsSection.tsx` showing 6 recent posts
    - Create `features/homepage/components/FieldsSection.tsx` listing all fields with post counts
    - Create `features/homepage/components/FeaturedBooksSection.tsx` showing 3 featured books
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [x] 17.2 Create Homepage route
    - Create `app/(routes)/page.tsx` assembling all homepage sections
    - Implement navigation handlers for post cards and field cards
    - _Requirements: 11.1, 11.6, 11.7_

  - [x] 17.3 Write unit tests for homepage components
    - Test each section renders correctly
    - Test navigation from homepage elements

- [x] 18. Checkpoint - Verify secondary features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: User Interaction (Search, Comments, Auth)

- [x] 19. Implement Search feature
  - [x] 19.1 Create Search components
    - Create `features/search/components/SearchInput.tsx` with debounce (300ms)
    - Implement keyboard navigation (Arrow Up/Down, Enter, Escape)
    - Create `features/search/components/SearchResults.tsx` with grouped results (Posts, Books)
    - Create `features/search/components/SearchResultItem.tsx` for individual result display
    - Create `features/search/hooks/useSearch.ts` integrating searchContent utility
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

  - [x] 19.2 Create Search page route
    - Create `app/(routes)/search/page.tsx` for full search results page
    - Display grouped results with pagination
    - _Requirements: 9.1_

  - [x] 19.3 Write unit tests for search components
    - Test debounce behavior
    - Test keyboard navigation
    - Test empty state display
    - Test result grouping

- [x] 20. Implement Authentication with NextAuth.js
  - [x] 20.1 Configure NextAuth.js with Google OAuth
    - Create `lib/auth/config.ts` with NextAuth configuration
    - Configure Google OAuth provider with client ID and secret
    - Set up session strategy and callbacks
    - Create `app/api/auth/[...nextauth]/route.ts` for NextAuth API routes
    - _Requirements: 4.3, 4.9_

  - [x] 20.2 Create authentication UI components
    - Create `features/comments/components/SignInButton.tsx` for Google sign-in
    - Display user profile (name, avatar) when authenticated
    - Implement sign-out functionality
    - _Requirements: 4.2, 4.4_

  - [x] 20.3 Write unit tests for authentication components
    - Test sign-in button rendering
    - Test authenticated state display
    - Test sign-out functionality

- [x] 21. Implement Comments feature
  - [x] 21.1 Create comment validation utility
    - Create `features/comments/utils/validation.ts` with Zod schema
    - Validate comment length: min 1, max 2000 characters
    - Define validation error messages in Vietnamese
    - _Requirements: 4.5, 4.6, 4.7_

  - [x] 21.2 Write property test for comment validation
    - **Property 2: Comment Validation Boundaries**
    - **Validates: Requirements 4.5, 4.6, 4.7**
    - Generate random strings of varying lengths (0, 1, 1000, 2000, 2001, 5000)
    - Verify validation accepts valid range [1, 2000] and rejects invalid
    - Test file: `features/comments/utils/__tests__/validation.property.test.ts`

  - [x] 21.3 Create Comment components
    - Create `features/comments/components/CommentForm.tsx` with validation
    - Create `features/comments/components/CommentList.tsx` displaying comments in ascending date order
    - Create `features/comments/components/CommentSection.tsx` as main container
    - Show sign-in button when unauthenticated, form when authenticated
    - Display loading spinner during submission
    - _Requirements: 4.1, 4.2, 4.4, 4.8_

  - [x] 21.4 Create Comments API route
    - Create `app/api/comments/route.ts` for comment submission
    - Validate authentication and comment content
    - Save comment to repository (localStorage for mock provider)
    - Return comment with 201 status within 2 seconds
    - _Requirements: 4.5_

  - [x] 21.5 Create comment hooks
    - Create `features/comments/hooks/useComments.ts` for fetching and submitting comments
    - Implement optimistic updates for better UX
    - Handle loading and error states
    - _Requirements: 4.5, 4.8_

  - [x] 21.6 Write unit tests for comment components
    - Test comment form validation
    - Test comment submission flow
    - Test unauthenticated state display
    - Test comment list rendering

- [x] 22. Checkpoint - Verify user interaction features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Polish & User Experience

- [x] 23. Implement Dark Mode
  - [x] 23.1 Create theme system
    - Create `lib/theme/ThemeProvider.tsx` with React Context
    - Create `lib/theme/useTheme.ts` hook for theme state management
    - Implement localStorage persistence for theme preference
    - Detect system preference with prefers-color-scheme media query
    - _Requirements: 15.3, 15.4_

  - [x] 23.2 Create theme toggle UI
    - Add theme toggle button to main navigation
    - Implement immediate theme switching without page reload
    - Ensure WCAG AA contrast ratios in both modes (4.5:1 for normal text, 3:1 for large text)
    - _Requirements: 15.1, 15.2, 15.5_

  - [x] 23.3 Apply dark mode styles
    - Configure Tailwind CSS with dark mode class strategy
    - Define CSS variables for theme colors in `app/globals.css`
    - Apply dark mode variants to all components
    - _Requirements: 15.2, 15.5_

  - [x] 23.4 Write unit tests for theme system
    - Test theme toggle functionality
    - Test localStorage persistence
    - Test system preference detection

- [x] 24. Implement Responsive Design
  - [x] 24.1 Make navigation responsive
    - Implement hamburger menu for mobile (<768px)
    - Create slide-out drawer for navigation tree on mobile
    - Ensure tap targets are at least 44×44 CSS pixels
    - _Requirements: 16.2, 16.6_

  - [x] 24.2 Make search responsive
    - Implement full-width overlay for search on mobile
    - Add search icon button trigger for mobile
    - _Requirements: 16.3_

  - [x] 24.3 Optimize images and videos for responsive
    - Configure Next.js Image component with appropriate sizes attribute
    - Implement responsive YouTube embeds with 16:9 aspect ratio
    - Test at breakpoints: 375px, 768px, 1024px, 1440px
    - _Requirements: 16.1, 16.4, 16.5_

  - [x] 24.4 Write responsive design tests
    - Test layout at different viewport widths
    - Test mobile navigation drawer
    - Test mobile search overlay

- [x] 25. Implement Loading States & Skeleton UI
  - [x] 25.1 Create Skeleton components
    - Create `components/ui/SkeletonPostCard.tsx` matching PostCard shape
    - Create `components/ui/SkeletonPostDetail.tsx` for post detail loading
    - Create `components/ui/SkeletonNavigationTree.tsx` for navigation loading
    - _Requirements: 17.1, 17.2_

  - [x] 25.2 Integrate loading states
    - Add loading spinners to comment section during submission/fetch
    - Add top-of-page progress indicator for client-side navigation
    - Ensure initial render with skeleton within 100ms
    - _Requirements: 17.3, 17.4, 17.5_

  - [x] 25.3 Write unit tests for loading states
    - Test skeleton components render correctly
    - Test loading spinners appear during async operations

- [x] 26. Implement Error Pages
  - Create `app/not-found.tsx` for 404 page with message, homepage link, and search input
  - Create `app/error.tsx` for 500 page with error message and homepage link
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 27. Checkpoint - Verify polish and UX features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: SEO, RSS, and Final Integration

- [x] 28. Implement SEO and metadata
  - [x] 28.1 Create URL generation utility
    - Create `lib/utils/urlGeneration.ts` with generatePostUrl function
    - Follow pattern: `/fields/{field-slug}/{category-slug}/{post-slug}`
    - Properly URL-encode all slugs
    - _Requirements: 10.1_

  - [x] 28.2 Write property test for URL generation
    - **Property 6: URL Generation Pattern Consistency**
    - **Validates: Requirements 10.1**
    - Generate random posts with various slug characteristics
    - Verify URL matches pattern and slugs are properly encoded
    - Test file: `features/posts/utils/__tests__/urlGeneration.property.test.ts`

  - [x] 28.3 Add metadata to pages
    - Add unique title and meta description to each post detail page
    - Add Open Graph metadata (og:title, og:description, og:image) to post pages
    - Use semantic HTML elements (article, nav, aside, header, main) throughout
    - _Requirements: 10.3, 10.4, 10.6_

  - [x] 28.4 Generate sitemap
    - Create `app/sitemap.ts` to generate sitemap.xml
    - Include all post URLs, books page, about page
    - _Requirements: 10.2, 10.5_

- [x] 29. Implement RSS Feed
  - [x] 29.1 Create RSS generation utility
    - Create `lib/utils/rssFeed.ts` with generateRSSFeed function
    - Include required fields: title, publication date, excerpt, URL, author name
    - Sort posts descending by publication date, limit to 50 most recent
    - Implement XML escaping for special characters
    - _Requirements: 19.2, 19.3_

  - [x] 29.2 Write property test for RSS feed correctness
    - **Property 7: RSS Feed Correctness**
    - **Validates: Requirements 19.2, 19.3**
    - Generate random post collections with varying sizes and dates
    - Verify RSS includes all required fields, correct sort order, and limit to 50
    - Test file: `features/posts/utils/__tests__/rssFeed.property.test.ts`

  - [x] 29.3 Create RSS route
    - Create `app/rss.xml/route.ts` for RSS feed endpoint
    - Use generateRSSFeed utility to create RSS 2.0 XML
    - Set appropriate headers (Content-Type, Cache-Control)
    - _Requirements: 19.1_

  - [x] 29.4 Add RSS link to layout
    - Add `<link rel="alternate" type="application/rss+xml">` to `app/layout.tsx`
    - _Requirements: 19.4_

  - [x] 29.5 Generate static RSS for mock provider
    - Create `scripts/generate-rss.ts` for build-time RSS generation
    - Output to `public/rss.xml` when using mock provider
    - _Requirements: 19.5_

- [x] 30. Create root layout and global styles
  - [x] 30.1 Create root layout
    - Create `app/layout.tsx` with HTML structure, metadata, and providers
    - Integrate ThemeProvider for dark mode
    - Add navigation sidebar and main content area
    - Include RSS feed link in head
    - _Requirements: 8.2_

  - [x] 30.2 Create global styles
    - Create `app/globals.css` with Tailwind directives and CSS variables
    - Define color variables for light and dark modes
    - Set base typography styles
    - _Requirements: 8.5_

- [x] 31. Wire all features together
  - Integrate NavigationTree into root layout sidebar
  - Integrate SearchInput into main navigation bar
  - Ensure all routes are properly connected
  - Verify data flows correctly from repository through components
  - Test navigation between all pages
  - _Requirements: 1.5, 9.1_

- [x] 32. Final checkpoint - End-to-end verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 19 requirements are covered
  - Test complete user flows: browse → read → comment, search → read, homepage → explore
  - Verify responsive design at all breakpoints
  - Verify dark mode works across all pages
  - Verify accessibility with keyboard navigation

### Phase 8: Supabase Provider (Optional - Future Enhancement)

- [ ] 33. Implement Supabase Provider (optional)
  - [ ] 33.1 Set up Supabase client
    - Install @supabase/supabase-js
    - Create `lib/data/providers/supabase/client.ts` with Supabase client configuration
    - Configure environment variables for Supabase URL and anon key

  - [ ] 33.2 Implement Supabase Provider
    - Create `lib/data/providers/supabase/index.ts` with SupabaseProvider class
    - Implement all ContentRepository methods using Supabase client
    - Map Supabase responses to domain types
    - Handle errors and return appropriate fallbacks
    - _Requirements: 7.3, 7.5_

  - [ ] 33.3 Write integration tests for Supabase Provider
    - Test all repository methods return consistent structure
    - Test error handling for network failures
    - Test data transformation from Supabase to domain types
    - _Requirements: 7.8_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities to address issues early
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and component behavior
- The implementation follows a feature-based architecture with clear separation of concerns
- All code uses TypeScript strict mode for type safety
- Mock provider enables development without external dependencies
- Supabase provider (Phase 8) can be implemented later without changing application code

---

## Requirements Coverage

All 19 requirements are covered across the implementation tasks:

- **Req 1**: Tasks 11.1-11.4 (Navigation Tree)
- **Req 2**: Tasks 12.1, 12.3 (Post Listing)
- **Req 3**: Tasks 12.1-12.3 (Post Detail)
- **Req 4**: Tasks 20.1-20.3, 21.1-21.6 (Comments & Auth)
- **Req 5**: Tasks 15.1-15.3 (Books)
- **Req 6**: Task 16 (About Page)
- **Req 7**: Tasks 3-4, 33.1-33.3 (Data Abstraction)
- **Req 8**: Tasks 1-2, 12.3, 30.1-30.2 (Architecture)
- **Req 9**: Tasks 9.1-9.2, 19.1-19.3 (Search)
- **Req 10**: Tasks 28.1-28.4 (SEO & URLs)
- **Req 11**: Task 17.1-17.2 (Homepage)
- **Req 12**: Tasks 8.1-8.2, 14.1-14.3 (Tags & Related Posts)
- **Req 13**: Tasks 6.1-6.2, 12.3 (Reading Time)
- **Req 14**: Task 12.2 (Social Sharing)
- **Req 15**: Tasks 23.1-23.4 (Dark Mode)
- **Req 16**: Tasks 24.1-24.4 (Responsive Design)
- **Req 17**: Tasks 25.1-25.3 (Loading States)
- **Req 18**: Task 26 (Error Pages)
- **Req 19**: Tasks 29.1-29.5 (RSS Feed)

---

## Property-Based Tests Summary

Seven correctness properties from the design document are tested:

1. **Property 1**: Reading Time Calculation (Task 6.2) - Validates Req 13.2
2. **Property 2**: Comment Validation Boundaries (Task 21.2) - Validates Req 4.5-4.7
3. **Property 3**: Table of Contents Hierarchy (Task 7.2) - Validates Req 3.4
4. **Property 4**: Related Posts Algorithm (Task 8.2) - Validates Req 12.4-12.5
5. **Property 5**: Search Result Correctness (Task 9.2) - Validates Req 9.3, 9.6
6. **Property 6**: URL Generation Pattern (Task 28.2) - Validates Req 10.1
7. **Property 7**: RSS Feed Correctness (Task 29.2) - Validates Req 19.2-19.3

All property tests use fast-check with minimum 100 iterations and are marked as optional sub-tasks.
