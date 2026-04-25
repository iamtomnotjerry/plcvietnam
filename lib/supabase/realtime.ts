/**
 * Supabase Realtime subscriptions
 * Used for live comment updates on post pages.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Comment = Database['public']['Tables']['comments']['Row'];

let _client: ReturnType<typeof createClient<Database>> | null = null;

function getRealtimeClient() {
  if (!_client) {
    _client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

/**
 * Subscribe to approved comments for a post.
 * Returns an unsubscribe function.
 */
export function subscribeToComments(
  postId: string,
  onInsert: (comment: Comment) => void
): () => void {
  const supabase = getRealtimeClient();

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
