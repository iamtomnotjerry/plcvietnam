-- Inline post body images (TipTap / HTML content). Separate from `thumbnails` (list cards / featured).
-- Public read so <img src="..."> works for anonymous readers; uploads go through API + service role.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post_media',
  'post_media',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for embedded images on the site (uploads use service role via API).
DROP POLICY IF EXISTS "post_media_objects_select" ON storage.objects;
CREATE POLICY "post_media_objects_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'post_media');
