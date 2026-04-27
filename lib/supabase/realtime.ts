/**
 * Supabase Realtime subscriptions
 * Used for live comment updates on post pages.
 * Uses singleton client to prevent memory leaks.
 */

import { getAnonClient } from './client-singleton';
import type { Database } from './database.types';

type Comment = Database['public']['Tables']['comments']['Row'];

/**
 * Subscribe to approved comments for a post.
 * Returns an unsubscribe function.
 */
export function subscribeToComments(
  postId: string,
  onInsert: (comment: Comment) => void
): () => void {
  const supabase = getAnonClient(); // ✅ Use singleton client

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
