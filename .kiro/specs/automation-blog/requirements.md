# Requirements Document

## Introduction

Automation Blog là một nền tảng blog chuyên biệt để chia sẻ kiến thức về tự động hóa công nghiệp, bao gồm hệ thống PLC, SCADA, và Siemens Automation. Nền tảng cho phép tác giả đăng bài viết kỹ thuật, chia sẻ sách, và tổ chức nội dung theo cấu trúc phân cấp rõ ràng. Người đọc có thể tìm kiếm nội dung dễ dàng và để lại bình luận thông qua đăng nhập Google. Hệ thống được xây dựng bằng Next.js với kiến trúc feature-based, sử dụng mock data ban đầu và có abstraction layer sẵn sàng kết nối Supabase.

## Glossary

- **Blog**: Hệ thống nền tảng blog tự động hóa công nghiệp
- **Field**: Lĩnh vực kỹ thuật cấp cao nhất trong cây phân cấp nội dung (ví dụ: PLC, SCADA, Siemens)
- **Category**: Tiêu đề lớn thuộc một Field, nhóm các bài viết liên quan
- **Post**: Bài viết kỹ thuật thuộc một Category
- **Book**: Tập sách/tài liệu kỹ thuật do tác giả chia sẻ
- **Comment**: Bình luận của người đọc trên một Post
- **Tag**: Nhãn phân loại ngang (cross-cutting) gắn vào Post, độc lập với cấu trúc Field/Category
- **Reader**: Người dùng đọc nội dung trên Blog
- **Author**: Người quản trị và đăng nội dung lên Blog
- **Content_Repository**: Lớp trừu tượng (abstraction layer) quản lý truy cập dữ liệu
- **Mock_Provider**: Triển khai Content_Repository sử dụng dữ liệu tĩnh (mock data)
- **Supabase_Provider**: Triển khai Content_Repository sử dụng Supabase (dự phòng tương lai)
- **Google_OAuth**: Cơ chế xác thực người dùng thông qua tài khoản Google
- **Navigation_Tree**: Cây điều hướng phân cấp Fields → Categories → Posts
- **Reading_Time**: Thời gian đọc ước tính của một Post, tính theo số từ chia cho 200 từ/phút
- **Skeleton_UI**: Placeholder hiển thị trong khi nội dung đang tải, có hình dạng tương tự nội dung thật

---

## Requirements

### Requirement 1: Cấu trúc phân cấp nội dung (Navigation Tree)

**User Story:** As a Reader, I want to browse content through a hierarchical tree of Fields → Categories → Posts, so that I can easily find articles relevant to my area of interest.

#### Acceptance Criteria

1. THE Blog SHALL display a Navigation_Tree with three levels: Fields at the top level, Categories as children of Fields, and Posts as children of Categories.
2. WHEN a Reader clicks on a Field in the Navigation_Tree, THE Blog SHALL expand the Field to show its Categories.
3. WHEN a Reader clicks on a Category in the Navigation_Tree, THE Blog SHALL expand the Category to show its Posts.
4. WHEN a Reader clicks on a Post in the Navigation_Tree, THE Blog SHALL navigate to the Post detail page.
5. THE Blog SHALL display the Navigation_Tree persistently in a sidebar visible on all content pages.
6. WHEN the Navigation_Tree contains more than 10 Fields, THE Blog SHALL provide a search input within the Navigation_Tree to filter Fields and Categories by name.

---

### Requirement 2: Hiển thị danh sách bài viết (Post Listing)

**User Story:** As a Reader, I want to see a list of posts within a category, so that I can choose which article to read.

#### Acceptance Criteria

1. WHEN a Reader navigates to a Category page, THE Blog SHALL display a list of Posts belonging to that Category.
2. THE Blog SHALL display for each Post in the list: title, publication date, a short excerpt (maximum 200 characters), and a thumbnail image if available.
3. WHEN a Reader clicks on a Post in the list, THE Blog SHALL navigate to the Post detail page within 300ms.
4. THE Blog SHALL display Posts in descending order by publication date by default.
5. WHEN a Category contains more than 20 Posts, THE Blog SHALL paginate the list with 20 Posts per page.

---

### Requirement 3: Hiển thị bài viết chi tiết (Post Detail)

**User Story:** As a Reader, I want to read a full technical article with rich content including images and embedded videos, so that I can learn about industrial automation topics.

#### Acceptance Criteria

1. WHEN a Reader navigates to a Post detail page, THE Blog SHALL display the full content of the Post including title, author name, publication date, Reading_Time, and body content.
2. THE Blog SHALL render inline images within Post body content with proper alt text.
3. THE Blog SHALL render embedded YouTube videos within Post body content as responsive iframes.
4. THE Blog SHALL display a table of contents for Posts with more than 3 headings, generated from the heading structure of the Post body.
5. WHEN a Reader reaches the end of a Post, THE Blog SHALL display navigation links to the previous and next Post within the same Category.
6. THE Blog SHALL display the breadcrumb path (Field → Category → Post title) at the top of each Post detail page.

---

### Requirement 4: Hệ thống bình luận (Comment System)

**User Story:** As a Reader, I want to leave comments on posts after signing in with my Google account, so that I can share my thoughts and ask questions.

#### Acceptance Criteria

1. THE Blog SHALL display a comment section at the bottom of each Post detail page.
2. WHEN a Reader is not authenticated, THE Blog SHALL display a "Sign in with Google" button in the comment section.
3. WHEN a Reader clicks "Sign in with Google", THE Blog SHALL initiate the Google_OAuth authentication flow.
4. WHEN Google_OAuth authentication succeeds, THE Blog SHALL display the Reader's Google profile name and avatar in the comment section.
5. WHEN an authenticated Reader submits a comment with at least 1 character and at most 2000 characters, THE Blog SHALL save the comment and display it in the comment list within 2 seconds.
6. IF a Reader submits a comment with 0 characters, THEN THE Blog SHALL display an inline validation error "Bình luận không được để trống" without submitting.
7. IF a Reader submits a comment exceeding 2000 characters, THEN THE Blog SHALL display an inline validation error "Bình luận không được vượt quá 2000 ký tự" without submitting.
8. THE Blog SHALL display comments in ascending order by submission date, showing commenter name, avatar, date, and comment text.
9. WHEN an authenticated Reader clicks "Đăng xuất", THE Blog SHALL terminate the Google_OAuth session and return the Reader to unauthenticated state.

---

### Requirement 5: Trang sách (Books Page)

**User Story:** As a Reader, I want to browse books and technical documents shared by the author, so that I can access in-depth learning resources.

#### Acceptance Criteria

1. THE Blog SHALL provide a dedicated Books page accessible from the main navigation.
2. THE Blog SHALL display each Book with: cover image, title, description (maximum 300 characters), author name, and a download or external link.
3. WHEN a Reader clicks on a Book, THE Blog SHALL navigate to the Book detail page or open the external link in a new browser tab.
4. THE Blog SHALL group Books by topic or series when more than one Book belongs to the same series.
5. WHEN the Books page contains more than 12 Books, THE Blog SHALL paginate the list with 12 Books per page.

---

### Requirement 6: Trang giới thiệu (About Page)

**User Story:** As a Reader, I want to learn about the author's background and expertise, so that I can understand the credibility of the content.

#### Acceptance Criteria

1. THE Blog SHALL provide a dedicated About page accessible from the main navigation.
2. THE Blog SHALL display on the About page: author name, profile photo, professional biography, areas of expertise, and contact information.
3. THE Blog SHALL display on the About page a list of the author's professional certifications or notable achievements related to industrial automation.
4. WHEN a Reader clicks a contact link on the About page, THE Blog SHALL open the appropriate contact channel (email client or social profile) in a new browser tab.

---

### Requirement 7: Abstraction Layer cho Data Access

**User Story:** As a Developer, I want a data abstraction layer that can switch between mock data and Supabase without changing application code, so that I can develop with mock data and deploy with a real database later.

#### Acceptance Criteria

1. THE Content_Repository SHALL expose a consistent interface for all data operations: fetching Fields, Categories, Posts, Books, and Comments.
2. THE Mock_Provider SHALL implement the Content_Repository interface using static JSON data files.
3. THE Supabase_Provider SHALL implement the Content_Repository interface using Supabase client calls.
4. WHEN the environment variable `DATA_PROVIDER` is set to `mock`, THE Blog SHALL use Mock_Provider for all data operations.
5. WHEN the environment variable `DATA_PROVIDER` is set to `supabase`, THE Blog SHALL use Supabase_Provider for all data operations.
6. IF `DATA_PROVIDER` is not set, THEN THE Blog SHALL default to Mock_Provider.
7. THE Content_Repository interface SHALL define typed return values for all operations using TypeScript interfaces.
8. FOR ALL data operations, switching from Mock_Provider to Supabase_Provider SHALL require no changes to components or pages outside the data layer.

---

### Requirement 8: Kiến trúc Feature-Based (Project Structure)

**User Story:** As a Developer, I want a feature-based folder structure in Next.js App Router, so that the codebase is scalable and each feature is self-contained.

#### Acceptance Criteria

1. THE Blog SHALL organize source code into feature modules, where each feature folder contains its own components, hooks, types, and data access files.
2. THE Blog SHALL use Next.js App Router with file-based routing under the `app/` directory.
3. THE Blog SHALL separate shared utilities, UI components, and types into a `shared/` or `lib/` directory distinct from feature modules.
4. THE Blog SHALL define TypeScript interfaces for all domain entities (Field, Category, Post, Book, Comment, Author) in a shared types file.
5. THE Blog SHALL use Next.js Image component for all images to enable automatic optimization.
6. THE Blog SHALL implement static generation (SSG) for Post detail pages using `generateStaticParams` to pre-render all Posts at build time when using Mock_Provider.

---

### Requirement 11: Trang chủ (Homepage)

**User Story:** As a Reader, I want a homepage that gives me an overview of the blog's content, so that I can quickly discover what topics are covered and find recent articles.

#### Acceptance Criteria

1. THE Blog SHALL provide a homepage accessible at the root URL `/`.
2. THE Blog SHALL display on the homepage: a hero section with the blog title, tagline, and a brief description of the blog's focus area.
3. THE Blog SHALL display on the homepage a "Bài viết mới nhất" section showing the 6 most recently published Posts, each with title, Category name, publication date, Reading_Time, and excerpt.
4. THE Blog SHALL display on the homepage a "Lĩnh vực" section listing all Fields with their Post count.
5. THE Blog SHALL display on the homepage a "Sách nổi bật" section showing up to 3 featured Books with cover image and title.
6. WHEN a Reader clicks on a Post card on the homepage, THE Blog SHALL navigate to the Post detail page.
7. WHEN a Reader clicks on a Field on the homepage, THE Blog SHALL navigate to the Field's first Category page.

---

### Requirement 12: Tags và Related Posts

**User Story:** As a Reader, I want to see tags on posts and find related articles, so that I can explore content on the same topic across different categories.

#### Acceptance Criteria

1. THE Blog SHALL display a list of Tags at the bottom of each Post detail page, above the comment section.
2. WHEN a Reader clicks on a Tag, THE Blog SHALL navigate to a Tag page at `/tags/[tag-slug]` listing all Posts with that Tag.
3. THE Blog SHALL display on each Tag page: the Tag name, total Post count, and a paginated list of Posts (20 per page) in descending order by publication date.
4. THE Blog SHALL display a "Bài viết liên quan" section at the bottom of each Post detail page showing up to 4 Posts that share at least one Tag with the current Post, excluding the current Post.
5. IF a Post has no Tags in common with other Posts, THEN THE Blog SHALL display up to 4 Posts from the same Category instead.
6. THE Content_Repository SHALL expose a `getPostsByTag(tagSlug)` operation and a `getRelatedPosts(postId, limit)` operation.

---

### Requirement 13: Reading Time và Post Metadata

**User Story:** As a Reader, I want to see how long an article will take to read before I start, so that I can decide whether to read it now or save it for later.

#### Acceptance Criteria

1. THE Blog SHALL calculate and display the Reading_Time for each Post on the Post detail page, Post list, and homepage Post cards.
2. THE Blog SHALL calculate Reading_Time as the total word count of the Post body divided by 200, rounded up to the nearest minute, displayed as "X phút đọc".
3. THE Blog SHALL display on each Post detail page: title, author name, publication date, Reading_Time, and view count.
4. THE Blog SHALL increment the view count of a Post by 1 each time a Reader loads the Post detail page.
5. WHEN using Mock_Provider, THE Blog SHALL store view counts in browser localStorage keyed by Post slug.

---

### Requirement 14: Social Sharing

**User Story:** As a Reader, I want to share interesting posts on social media, so that I can recommend content to my colleagues and network.

#### Acceptance Criteria

1. THE Blog SHALL display social sharing buttons on each Post detail page for: Facebook, LinkedIn, and Twitter/X.
2. WHEN a Reader clicks the Facebook sharing button, THE Blog SHALL open a Facebook share dialog pre-filled with the Post URL and title in a new browser tab.
3. WHEN a Reader clicks the LinkedIn sharing button, THE Blog SHALL open a LinkedIn share dialog pre-filled with the Post URL in a new browser tab.
4. WHEN a Reader clicks the Twitter/X sharing button, THE Blog SHALL open a Twitter/X compose dialog pre-filled with the Post title and URL in a new browser tab.
5. THE Blog SHALL display a "Sao chép liên kết" button that copies the current Post URL to the clipboard and displays a confirmation tooltip "Đã sao chép!" for 2 seconds.

---

### Requirement 15: Dark Mode

**User Story:** As a Reader, I want to switch between light and dark display modes, so that I can read comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Blog SHALL provide a toggle button in the main navigation to switch between light mode and dark mode.
2. WHEN a Reader toggles dark mode, THE Blog SHALL apply the dark color scheme to all pages immediately without a full page reload.
3. THE Blog SHALL persist the Reader's mode preference in localStorage and apply it on subsequent visits.
4. WHEN no preference is stored, THE Blog SHALL default to the Reader's operating system preference using the `prefers-color-scheme` media query.
5. THE Blog SHALL ensure all text in dark mode meets WCAG AA contrast ratio (minimum 4.5:1 for normal text, 3:1 for large text).

---

### Requirement 16: Responsive Design và Mobile Experience

**User Story:** As a Reader, I want the blog to be fully usable on my mobile phone or tablet, so that I can read articles on any device.

#### Acceptance Criteria

1. THE Blog SHALL render correctly and be fully functional at viewport widths of 375px, 768px, 1024px, and 1440px.
2. WHEN the viewport width is less than 768px, THE Blog SHALL collapse the Navigation_Tree sidebar into a slide-out drawer accessible via a hamburger menu button.
3. WHEN the viewport width is less than 768px, THE Blog SHALL display the search input as a full-width overlay triggered by a search icon button.
4. THE Blog SHALL render all images responsively using the Next.js Image component with appropriate `sizes` attribute for each breakpoint.
5. THE Blog SHALL render embedded YouTube videos as responsive iframes maintaining a 16:9 aspect ratio at all viewport widths.
6. THE Blog SHALL ensure all tap targets on mobile are at least 44×44 CSS pixels.

---

### Requirement 17: Loading States và Skeleton UI

**User Story:** As a Reader, I want to see visual feedback while content is loading, so that I know the page is working and not frozen.

#### Acceptance Criteria

1. THE Blog SHALL display Skeleton_UI placeholders for Post lists, Post detail content, and the Navigation_Tree while data is being fetched.
2. THE Blog SHALL display a Skeleton_UI placeholder matching the shape of a Post card (title bar, excerpt lines, metadata row) while the Post list is loading.
3. THE Blog SHALL display a loading spinner in the comment section while comments are being submitted or fetched.
4. WHEN a page transition occurs via Next.js client-side navigation, THE Blog SHALL display a progress indicator at the top of the page.
5. THE Blog SHALL complete initial page render with Skeleton_UI visible within 100ms of navigation on a standard connection.

---

### Requirement 18: Error Pages (404 và 500)

**User Story:** As a Reader, I want to see a helpful error page when something goes wrong, so that I can navigate back to valid content instead of seeing a broken page.

#### Acceptance Criteria

1. THE Blog SHALL display a custom 404 page when a Reader navigates to a URL that does not match any Post, Category, Field, Tag, or static page.
2. THE Blog SHALL display on the 404 page: a clear "Trang không tìm thấy" message, a link to the homepage, and a search input.
3. THE Blog SHALL display a custom 500 page when an unhandled server error occurs.
4. THE Blog SHALL display on the 500 page: a "Đã xảy ra lỗi" message and a link to the homepage.
5. THE Blog SHALL implement the 404 page using Next.js `not-found.tsx` and the 500 page using Next.js `error.tsx` conventions.

---

### Requirement 19: RSS Feed

**User Story:** As a Reader, I want to subscribe to the blog via RSS, so that I can receive new articles in my feed reader without visiting the site.

#### Acceptance Criteria

1. THE Blog SHALL generate an RSS 2.0 feed accessible at `/rss.xml`.
2. THE RSS feed SHALL include for each Post: title, publication date, excerpt as description, full URL, and author name.
3. THE RSS feed SHALL list Posts in descending order by publication date, limited to the 50 most recent Posts.
4. THE Blog SHALL set the `<link rel="alternate" type="application/rss+xml">` tag in the `<head>` of all pages pointing to `/rss.xml`.
5. WHEN using Mock_Provider, THE Blog SHALL generate the RSS feed at build time as a static file.

---

### Requirement 9: Tìm kiếm nội dung (Search)

**User Story:** As a Reader, I want to search for posts and books by keyword, so that I can quickly find content on a specific topic.

#### Acceptance Criteria

1. THE Blog SHALL provide a search input accessible from the main navigation bar on all pages.
2. WHEN a Reader enters a keyword of at least 2 characters in the search input, THE Blog SHALL display search results within 500ms.
3. THE Blog SHALL search across Post titles, Post excerpts, Category names, and Book titles.
4. THE Blog SHALL display search results grouped by type: Posts and Books.
5. WHEN no results are found for a keyword, THE Blog SHALL display the message "Không tìm thấy kết quả cho '[keyword]'".
6. WHEN using Mock_Provider, THE Blog SHALL perform search as a client-side filter over the full mock dataset.

---

### Requirement 10: Điều hướng và SEO

**User Story:** As a Reader, I want each page to have a meaningful URL and proper metadata, so that I can share links and find content through search engines.

#### Acceptance Criteria

1. THE Blog SHALL generate URLs following the pattern `/fields/[field-slug]/[category-slug]/[post-slug]` for Post detail pages.
2. THE Blog SHALL generate URLs following the pattern `/books` for the Books page and `/about` for the About page.
3. THE Blog SHALL set a unique `<title>` and `<meta name="description">` for each Post detail page using the Post title and excerpt.
4. THE Blog SHALL set Open Graph metadata (`og:title`, `og:description`, `og:image`) for each Post detail page.
5. THE Blog SHALL generate a `sitemap.xml` listing all published Post URLs, the Books page, and the About page.
6. THE Blog SHALL use semantic HTML elements (`<article>`, `<nav>`, `<aside>`, `<header>`, `<main>`) throughout all pages.
