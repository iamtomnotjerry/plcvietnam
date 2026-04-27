/**
 * Supabase Storage Service
 * Handles file uploads for thumbnails, avatars, and book covers.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Bucket = 'thumbnails' | 'avatars' | 'books';

function getClient() {
  // Use service role key for uploads (bypasses RLS/storage policies)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  bucket: Bucket,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<string> {
  const supabase = getClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: contentType ?? (file instanceof File ? file.type : 'application/octet-stream'),
    upsert: true,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a thumbnail image for a post.
 * Path: thumbnails/{postSlug}/{filename}
 */
export async function uploadThumbnail(postSlug: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${postSlug}/thumbnail.${ext}`;
  return uploadFile('thumbnails', path, file, file.type);
}

/**
 * Upload a user avatar.
 * Path: avatars/{userId}/{filename}
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;
  return uploadFile('avatars', path, file, file.type);
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(bucket: Bucket, path: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Get public URL for a stored file.
 */
export function getPublicUrl(bucket: Bucket, path: string): string {
  const supabase = getClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
