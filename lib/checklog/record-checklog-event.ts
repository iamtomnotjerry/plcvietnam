import { getServiceClient } from '@/lib/supabase/client-singleton';
import type { Json } from '@/lib/supabase/database.types';

export type ChecklogSource = 'edge' | 'server';

export type RecordChecklogInput = {
  category: string;
  channel: string;
  source: ChecklogSource;
  http_method?: string | null;
  path?: string | null;
  query_redacted?: string | null;
  status_code?: number | null;
  actor_user_id?: string | null;
  email_hash?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
  outcome?: string | null;
  metadata?: Json;
};

/**
 * Best-effort insert; never throws to callers.
 */
export async function recordChecklogEvent(row: RecordChecklogInput): Promise<void> {
  try {
    const { error } = await getServiceClient()
      .from('checklog_events')
      .insert({
        category: row.category,
        channel: row.channel,
        source: row.source,
        http_method: row.http_method ?? null,
        path: row.path ?? null,
        query_redacted: row.query_redacted ?? null,
        status_code: row.status_code ?? null,
        actor_user_id: row.actor_user_id ?? null,
        email_hash: row.email_hash ?? null,
        ip: row.ip ?? null,
        user_agent: row.user_agent ?? null,
        request_id: row.request_id ?? null,
        outcome: row.outcome ?? null,
        metadata: (row.metadata ?? {}) as Json,
      });
    if (error) {
      console.error('[checklog] insert failed', error.message);
    }
  } catch (e) {
    console.error('[checklog] insert exception', e);
  }
}
