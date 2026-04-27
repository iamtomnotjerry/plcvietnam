-- ============================================
-- PERFORMANCE OPTIMIZATIONS & MISSING FUNCTIONS
-- ============================================

-- ── Add Missing Columns ───────────────────────────────────────────────────────

-- Add featured column to books
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add volume and pages to books
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS volume INTEGER;

ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS pages INTEGER;

-- Add cover_image_url alias (for consistency)
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Update existing cover_url to cover_image_url
UPDATE public.books 
SET cover_image_url = cover_url 
WHERE cover_image_url IS NULL AND cover_url IS NOT NULL;

-- Add author_name alias
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS author_name TEXT;

UPDATE public.books 
SET author_name = author 
WHERE author_name IS NULL AND author IS NOT NULL;

-- ── Performance Indexes ───────────────────────────────────────────────────────

-- Composite index for filtered category queries
CREATE INDEX IF NOT EXISTS idx_posts_category_status_published 
ON public.posts(category_id, status, published_at DESC)
WHERE status = 'published';

-- Partial index for published posts only (smaller, faster)
CREATE INDEX IF NOT EXISTS idx_posts_status_published 
ON public.posts(status, published_at DESC) 
WHERE status = 'published';

-- Index for tag-based queries
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_post 
ON public.post_tags(tag_id, post_id);

-- Index for approved comments
CREATE INDEX IF NOT EXISTS idx_comments_post_approved 
ON public.comments(post_id, is_approved, created_at DESC)
WHERE is_approved = true;

-- Full-text search index for posts
CREATE INDEX IF NOT EXISTS idx_posts_search 
ON public.posts 
USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- Index for books search
CREATE INDEX IF NOT EXISTS idx_books_search 
ON public.books 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Index for field_id in posts (for field-based queries)
CREATE INDEX IF NOT EXISTS idx_posts_field_id 
ON public.posts(field_id);

-- Index for view count (for trending posts)
CREATE INDEX IF NOT EXISTS idx_posts_view_count 
ON public.posts(view_count DESC);

-- Index for user comments
CREATE INDEX IF NOT EXISTS idx_comments_user_id 
ON public.comments(user_id);

-- ── Database Functions ────────────────────────────────────────────────────────

-- Function to increment post view count atomically
CREATE OR REPLACE FUNCTION increment_post_view(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create comment atomically (prevents race conditions)
CREATE OR REPLACE FUNCTION create_comment_atomic(
  p_post_id UUID,
  p_user_id UUID,
  p_author_name TEXT,
  p_author_email TEXT,
  p_author_avatar TEXT,
  p_content TEXT
) RETURNS public.comments AS $$
DECLARE
  v_comment public.comments;
BEGIN
  -- Insert comment
  INSERT INTO public.comments (
    post_id, 
    user_id, 
    author_name, 
    author_email, 
    author_avatar, 
    content,
    is_approved
  )
  VALUES (
    p_post_id, 
    p_user_id, 
    p_author_name, 
    p_author_email, 
    p_author_avatar, 
    p_content,
    false
  )
  RETURNING * INTO v_comment;
  
  -- Update comment count atomically
  UPDATE public.posts 
  SET comment_count = comment_count + 1
  WHERE id = p_post_id;
  
  RETURN v_comment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for full-text search on posts
CREATE OR REPLACE FUNCTION search_posts(
  query TEXT,
  result_limit INTEGER DEFAULT 10
) RETURNS SETOF public.posts AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.posts p
  WHERE 
    p.status = 'published'
    AND (
      to_tsvector('english', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content) 
      @@ plainto_tsquery('english', query)
    )
  ORDER BY 
    ts_rank(
      to_tsvector('english', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content),
      plainto_tsquery('english', query)
    ) DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Database Constraints ──────────────────────────────────────────────────────

-- Ensure reading time is positive
ALTER TABLE public.posts 
ADD CONSTRAINT check_reading_time_positive 
CHECK (reading_time IS NULL OR reading_time > 0);

-- Ensure view count is non-negative
ALTER TABLE public.posts 
ADD CONSTRAINT check_view_count_non_negative 
CHECK (view_count >= 0);

-- Ensure comment count is non-negative
ALTER TABLE public.posts 
ADD CONSTRAINT check_comment_count_non_negative 
CHECK (comment_count >= 0);

-- Ensure post count is non-negative
ALTER TABLE public.fields 
ADD CONSTRAINT check_post_count_non_negative 
CHECK (post_count >= 0);

ALTER TABLE public.categories 
ADD CONSTRAINT check_post_count_non_negative 
CHECK (post_count >= 0);

ALTER TABLE public.tags 
ADD CONSTRAINT check_post_count_non_negative 
CHECK (post_count >= 0);

-- ── Optimize Existing Triggers ────────────────────────────────────────────────

-- Optimize field post count trigger (handle NULL field_id)
CREATE OR REPLACE FUNCTION update_field_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.field_id IS NOT NULL THEN
    UPDATE public.fields SET post_count = post_count + 1 WHERE id = NEW.field_id;
  ELSIF TG_OP = 'DELETE' AND OLD.field_id IS NOT NULL THEN
    UPDATE public.fields SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.field_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.field_id IS DISTINCT FROM NEW.field_id THEN
    IF OLD.field_id IS NOT NULL THEN
      UPDATE public.fields SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.field_id;
    END IF;
    IF NEW.field_id IS NOT NULL THEN
      UPDATE public.fields SET post_count = post_count + 1 WHERE id = NEW.field_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Optimize category post count trigger (handle NULL category_id)
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL THEN
    UPDATE public.categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE public.categories SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE public.categories SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.category_id;
    END IF;
    IF NEW.category_id IS NOT NULL THEN
      UPDATE public.categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Optimize tag post count trigger
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Optimize comment count trigger
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ── Analyze Tables for Query Planner ──────────────────────────────────────────

ANALYZE public.posts;
ANALYZE public.categories;
ANALYZE public.fields;
ANALYZE public.tags;
ANALYZE public.post_tags;
ANALYZE public.comments;
ANALYZE public.books;
