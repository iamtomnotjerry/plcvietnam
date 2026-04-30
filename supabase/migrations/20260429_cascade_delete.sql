-- Migration: Add CASCADE DELETE to foreign keys
-- When a field is deleted, all its categories and posts are deleted
-- When a category is deleted, all its posts are deleted

-- Drop existing foreign key constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_field_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_id_fkey;

-- Add CASCADE DELETE constraints
ALTER TABLE categories
  ADD CONSTRAINT categories_field_id_fkey
  FOREIGN KEY (field_id)
  REFERENCES fields(id)
  ON DELETE CASCADE;

ALTER TABLE posts
  ADD CONSTRAINT posts_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES categories(id)
  ON DELETE CASCADE;

-- Also add CASCADE for post_tags junction table
ALTER TABLE post_tags DROP CONSTRAINT IF EXISTS post_tags_post_id_fkey;
ALTER TABLE post_tags DROP CONSTRAINT IF EXISTS post_tags_tag_id_fkey;

ALTER TABLE post_tags
  ADD CONSTRAINT post_tags_post_id_fkey
  FOREIGN KEY (post_id)
  REFERENCES posts(id)
  ON DELETE CASCADE;

ALTER TABLE post_tags
  ADD CONSTRAINT post_tags_tag_id_fkey
  FOREIGN KEY (tag_id)
  REFERENCES tags(id)
  ON DELETE CASCADE;

-- Add CASCADE for comments
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

ALTER TABLE comments
  ADD CONSTRAINT comments_post_id_fkey
  FOREIGN KEY (post_id)
  REFERENCES posts(id)
  ON DELETE CASCADE;
