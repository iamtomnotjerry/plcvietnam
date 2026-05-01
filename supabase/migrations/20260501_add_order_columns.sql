-- Add order columns to fields, categories, and posts tables for custom sorting
-- Migration: 20260501_add_order_columns

-- Add order column to fields table
ALTER TABLE fields 
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Add order column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Add order column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fields_order ON fields("order");
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_posts_order ON posts("order");

-- Set initial order values based on current alphabetical order
-- Fields: order by name
WITH ordered_fields AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 AS new_order
  FROM fields
)
UPDATE fields
SET "order" = ordered_fields.new_order
FROM ordered_fields
WHERE fields.id = ordered_fields.id;

-- Categories: order by field_id, then name
WITH ordered_categories AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY field_id ORDER BY name) - 1 AS new_order
  FROM categories
)
UPDATE categories
SET "order" = ordered_categories.new_order
FROM ordered_categories
WHERE categories.id = ordered_categories.id;

-- Posts: order by category_id, then published_at desc
WITH ordered_posts AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY published_at DESC NULLS LAST) - 1 AS new_order
  FROM posts
)
UPDATE posts
SET "order" = ordered_posts.new_order
FROM ordered_posts
WHERE posts.id = ordered_posts.id;

-- Add comments
COMMENT ON COLUMN fields."order" IS 'Display order for fields in navigation tree (0-based)';
COMMENT ON COLUMN categories."order" IS 'Display order for categories within a field (0-based)';
COMMENT ON COLUMN posts."order" IS 'Display order for posts within a category (0-based)';
