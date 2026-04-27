-- Migration: Add Performance Indexes
-- Created: 2026-04-27
-- Purpose: Optimize common queries and prevent performance bottlenecks at scale

-- ============================================================================
-- POSTS TABLE INDEXES
-- ============================================================================

-- Full-text search index (GIN index for ts_vector)
-- Enables fast full-text search on posts
CREATE INDEX IF NOT EXISTS idx_posts_search_vector 
ON posts USING GIN(search_vector);

-- Composite index for post listings (most common query)
-- Covers: WHERE status = 'published' ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_list_published 
ON posts(status, published_at DESC) 
WHERE status = 'published';

-- Composite index for category + status queries
-- Covers: WHERE category_id = X AND status = 'published' ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_category_status_published 
ON posts(category_id, status, published_at DESC) 
WHERE status = 'published';

-- Covering index for post listings (includes commonly fetched columns)
-- Reduces need to access table heap for list views
CREATE INDEX IF NOT EXISTS idx_posts_list_covering 
ON posts(status, published_at DESC) 
INCLUDE (id, slug, title, excerpt, thumbnail_url, view_count);

-- Index for slug lookups (already exists, but ensuring it's optimized)
CREATE INDEX IF NOT EXISTS idx_posts_slug 
ON posts(slug) 
WHERE status = 'published';

-- Index for author queries
CREATE INDEX IF NOT EXISTS idx_posts_author 
ON posts(author_id, status, published_at DESC);

-- ============================================================================
-- POST_TAGS TABLE INDEXES
-- ============================================================================

-- Composite index for tag lookups (reverse direction)
-- Enables efficient "find all posts with tag X"
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_post 
ON post_tags(tag_id, post_id);

-- Composite index for post lookups (forward direction)
-- Enables efficient "find all tags for post X"
CREATE INDEX IF NOT EXISTS idx_post_tags_post_tag 
ON post_tags(post_id, tag_id);

-- ============================================================================
-- COMMENTS TABLE INDEXES
-- ============================================================================

-- Composite index for post comments
-- Covers: WHERE post_id = X AND status = 'approved' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_comments_post_status_created 
ON comments(post_id, status, created_at DESC);

-- Index for user comments
CREATE INDEX IF NOT EXISTS idx_comments_user 
ON comments(user_id, created_at DESC);

-- Index for parent comment lookups (threaded comments)
CREATE INDEX IF NOT EXISTS idx_comments_parent 
ON comments(parent_id) 
WHERE parent_id IS NOT NULL;

-- ============================================================================
-- BOOKS TABLE INDEXES
-- ============================================================================

-- Composite index for book listings
CREATE INDEX IF NOT EXISTS idx_books_status_published 
ON books(status, published_at DESC) 
WHERE status = 'published';

-- Index for author lookups
CREATE INDEX IF NOT EXISTS idx_books_author 
ON books(author_id, status, published_at DESC);

-- Index for featured books
CREATE INDEX IF NOT EXISTS idx_books_featured 
ON books(is_featured, status, published_at DESC) 
WHERE is_featured = true AND status = 'published';

-- ============================================================================
-- CATEGORIES TABLE INDEXES
-- ============================================================================

-- Index for field lookups
CREATE INDEX IF NOT EXISTS idx_categories_field 
ON categories(field_id, display_order);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug 
ON categories(slug);

-- ============================================================================
-- TAGS TABLE INDEXES
-- ============================================================================

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_tags_slug 
ON tags(slug);

-- Index for name searches (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_tags_name_lower 
ON tags(LOWER(name));

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Index for email lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_email_lower 
ON users(LOWER(email));

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================

-- Update table statistics for query planner
ANALYZE posts;
ANALYZE post_tags;
ANALYZE comments;
ANALYZE books;
ANALYZE categories;
ANALYZE tags;
ANALYZE users;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_posts_search_vector IS 'Full-text search index for posts';
COMMENT ON INDEX idx_posts_list_published IS 'Optimizes post listing queries';
COMMENT ON INDEX idx_posts_category_status_published IS 'Optimizes category-filtered post queries';
COMMENT ON INDEX idx_posts_list_covering IS 'Covering index to avoid heap access for list views';
COMMENT ON INDEX idx_post_tags_tag_post IS 'Optimizes tag-to-posts lookups';
COMMENT ON INDEX idx_post_tags_post_tag IS 'Optimizes post-to-tags lookups';
COMMENT ON INDEX idx_comments_post_status_created IS 'Optimizes comment listing for posts';
COMMENT ON INDEX idx_books_featured IS 'Optimizes featured books query';
