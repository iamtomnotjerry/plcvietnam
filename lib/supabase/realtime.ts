/**
 * Supabase Realtime subscriptions
 * Used for live comment updates on post pages.
 *
 * IMPORTANT: This module is consumed by client hooks.
 * Do not import server-side env validation here.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Comment = Database['public']['Tables']['comments']['Row'];
let browserAnonClient: SupabaseClient<Database> | null = null;

function getBrowserAnonClient(): SupabaseClient<Database> {
  if (browserAnonClient) return browserAnonClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are missing');
  }

  browserAnonClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });

  return browserAnonClient;
}

/**
 * Subscribe to approved comments for a post.
 * Returns an unsubscribe function.
 */
export function subscribeToComments(
  postId: string,
  onInsert: (comment: Comment) => void
): () => void {
  const supabase = getBrowserAnonClient();

  const channel = supabase
    .channel(`comments:${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => {
        const comment = payload.new as Comment;
        // Only notify when comment becomes approved
        if (comment.is_approved) {
          onInsert(comment);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
