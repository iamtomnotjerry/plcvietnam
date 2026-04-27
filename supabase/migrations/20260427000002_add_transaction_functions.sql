-- Migration: Add Transaction Functions
-- Created: 2026-04-27
-- Purpose: Add database functions for atomic operations

-- ============================================================================
-- CREATE POST WITH TAGS (ATOMIC)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_post_with_tags(
  post_data jsonb,
  tag_ids uuid[]
) RETURNS jsonb AS $$
DECLARE
  new_post_id uuid;
  result jsonb;
BEGIN
  -- Insert post
  INSERT INTO posts (
    title, slug, excerpt, content, thumbnail_url,
    category_id, author_id, status, published_at,
    meta_title, meta_description, search_vector
  )
  VALUES (
    post_data->>'title',
    post_data->>'slug',
    post_data->>'excerpt',
    post_data->>'content',
    post_data->>'thumbnail_url',
    (post_data->>'category_id')::uuid,
    (post_data->>'author_id')::uuid,
    COALESCE(post_data->>'status', 'draft'),
    CASE 
      WHEN post_data->>'published_at' IS NOT NULL 
      THEN (post_data->>'published_at')::timestamptz 
      ELSE NULL 
    END,
    post_data->>'meta_title',
    post_data->>'meta_description',
    to_tsvector('english', 
      COALESCE(post_data->>'title', '') || ' ' || 
      COALESCE(post_data->>'excerpt', '') || ' ' || 
      COALESCE(post_data->>'content', '')
    )
  )
  RETURNING id INTO new_post_id;

  -- Insert post_tags (if any)
  IF array_length(tag_ids, 1) > 0 THEN
    INSERT INTO post_tags (post_id, tag_id)
    SELECT new_post_id, unnest(tag_ids);
  END IF;

  -- Return the created post with tags
  SELECT jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'slug', p.slug,
    'excerpt', p.excerpt,
    'content', p.content,
    'thumbnail_url', p.thumbnail_url,
    'category_id', p.category_id,
    'author_id', p.author_id,
    'status', p.status,
    'published_at', p.published_at,
    'meta_title', p.meta_title,
    'meta_description', p.meta_description,
    'view_count', p.view_count,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'tags', COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug
        ))
        FROM post_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = p.id
      ),
      '[]'::jsonb
    )
  )
  INTO result
  FROM posts p
  WHERE p.id = new_post_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE POST WITH TAGS (ATOMIC)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_post_with_tags(
  post_id uuid,
  post_data jsonb,
  tag_ids uuid[]
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Update post
  UPDATE posts
  SET
    title = COALESCE(post_data->>'title', title),
    slug = COALESCE(post_data->>'slug', slug),
    excerpt = COALESCE(post_data->>'excerpt', excerpt),
    content = COALESCE(post_data->>'content', content),
    thumbnail_url = COALESCE(post_data->>'thumbnail_url', thumbnail_url),
    category_id = COALESCE((post_data->>'category_id')::uuid, category_id),
    status = COALESCE(post_data->>'status', status),
    published_at = CASE 
      WHEN post_data->>'published_at' IS NOT NULL 
      THEN (post_data->>'published_at')::timestamptz 
      ELSE published_at 
    END,
    meta_title = COALESCE(post_data->>'meta_title', meta_title),
    meta_description = COALESCE(post_data->>'meta_description', meta_description),
    search_vector = to_tsvector('english', 
      COALESCE(post_data->>'title', title) || ' ' || 
      COALESCE(post_data->>'excerpt', excerpt) || ' ' || 
      COALESCE(post_data->>'content', content)
    ),
    updated_at = now()
  WHERE id = post_id;

  -- Update tags (if provided)
  IF tag_ids IS NOT NULL THEN
    -- Delete existing tags
    DELETE FROM post_tags WHERE post_tags.post_id = update_post_with_tags.post_id;
    
    -- Insert new tags
    IF array_length(tag_ids, 1) > 0 THEN
      INSERT INTO post_tags (post_id, tag_id)
      SELECT update_post_with_tags.post_id, unnest(tag_ids);
    END IF;
  END IF;

  -- Return the updated post with tags
  SELECT jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'slug', p.slug,
    'excerpt', p.excerpt,
    'content', p.content,
    'thumbnail_url', p.thumbnail_url,
    'category_id', p.category_id,
    'author_id', p.author_id,
    'status', p.status,
    'published_at', p.published_at,
    'meta_title', p.meta_title,
    'meta_description', p.meta_description,
    'view_count', p.view_count,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'tags', COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug
        ))
        FROM post_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = p.id
      ),
      '[]'::jsonb
    )
  )
  INTO result
  FROM posts p
  WHERE p.id = post_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEARCH POSTS (FULL-TEXT SEARCH)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_posts(
  search_query text,
  search_limit int DEFAULT 20,
  search_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  thumbnail_url text,
  published_at timestamptz,
  view_count int,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.thumbnail_url,
    p.published_at,
    p.view_count,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM posts p
  WHERE 
    p.status = 'published'
    AND p.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, p.published_at DESC
  LIMIT search_limit
  OFFSET search_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INCREMENT VIEW COUNT (ATOMIC)
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_post_view(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET RELATED POSTS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_related_posts(
  post_id uuid,
  result_limit int DEFAULT 5
) RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  thumbnail_url text,
  published_at timestamptz,
  view_count int
) AS $$
BEGIN
  RETURN QUERY
  WITH post_tags_cte AS (
    SELECT tag_id
    FROM post_tags
    WHERE post_tags.post_id = get_related_posts.post_id
  )
  SELECT DISTINCT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.thumbnail_url,
    p.published_at,
    p.view_count
  FROM posts p
  JOIN post_tags pt ON pt.post_id = p.id
  WHERE 
    p.id != get_related_posts.post_id
    AND p.status = 'published'
    AND pt.tag_id IN (SELECT tag_id FROM post_tags_cte)
  ORDER BY p.published_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_post_with_tags TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_with_tags TO authenticated;
GRANT EXECUTE ON FUNCTION search_posts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_post_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_related_posts TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION create_post_with_tags IS 'Atomically creates a post with tags';
COMMENT ON FUNCTION update_post_with_tags IS 'Atomically updates a post and its tags';
COMMENT ON FUNCTION search_posts IS 'Full-text search on posts using ts_vector';
COMMENT ON FUNCTION increment_post_view IS 'Atomically increments post view count';
COMMENT ON FUNCTION get_related_posts IS 'Gets related posts based on shared tags';
