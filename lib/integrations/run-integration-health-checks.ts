import { Redis } from '@upstash/redis';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import type {
  IntegrationHealthReport,
  IntegrationStatusItem,
  IntegrationStatusLevel,
} from '@/lib/integrations/types';

/**
 * Admin-only snapshot: config + minimal live probes. Never returns secret values.
 */
export async function runIntegrationHealthChecks(): Promise<IntegrationHealthReport> {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const vercel = process.env.VERCEL === '1';
  const items: IntegrationStatusItem[] = [];

  // —— Supabase (DB reachability via service client) ——
  const supabaseCodes: string[] = [];
  let supabaseLevel: IntegrationStatusLevel = 'ok';
  let supabaseLiveOk = false;
  try {
    const db = getServiceClient();
    const { error } = await db.from('profiles').select('id').limit(1);
    if (error) {
      supabaseLevel = 'error';
      supabaseCodes.push('db_error');
    } else {
      supabaseLiveOk = true;
      supabaseCodes.push('db_ok');
    }
  } catch {
    supabaseLevel = 'error';
    supabaseCodes.push('db_exception');
  }
  items.push({
    id: 'supabase',
    level: supabaseLevel,
    liveCheck: true,
    liveOk: supabaseLiveOk,
    detailCodes: supabaseCodes,
  });

  // —— Upstash Redis ——
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasUpstash = Boolean(upstashUrl?.trim() && upstashToken?.trim());
  const upstashCodes: string[] = [];
  let upstashLevel: IntegrationStatusLevel = 'info';
  let upstashLiveOk = false;

  if (nodeEnv === 'production' && !hasUpstash) {
    upstashLevel = 'error';
    upstashCodes.push('required_missing');
  } else if (!hasUpstash) {
    upstashLevel = 'warn';
    upstashCodes.push('dev_memory_fallback');
  } else {
    try {
      const redis = new Redis({ url: upstashUrl!, token: upstashToken! });
      const pong = await redis.ping();
      if (pong === 'PONG') {
        upstashLevel = 'ok';
        upstashLiveOk = true;
        upstashCodes.push('ping_ok');
      } else {
        upstashLevel = 'warn';
        upstashCodes.push('ping_unexpected');
      }
    } catch {
      upstashLevel = 'error';
      upstashCodes.push('ping_failed');
    }
  }
  items.push({
    id: 'upstash',
    level: upstashLevel,
    liveCheck: hasUpstash,
    liveOk: hasUpstash ? upstashLiveOk : undefined,
    detailCodes: upstashCodes,
  });

  // —— Cloudflare Turnstile ——
  const turnSite = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
  const turnSecret = Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
  const turnCodes: string[] = [];
  let turnLevel: IntegrationStatusLevel = 'ok';
  if (turnSite && turnSecret) {
    turnCodes.push('configured');
  } else if (!turnSite && !turnSecret) {
    turnCodes.push('not_configured');
    turnLevel = nodeEnv === 'production' ? 'warn' : 'info';
  } else {
    turnLevel = 'error';
    turnCodes.push('misconfigured');
  }
  items.push({
    id: 'turnstile',
    level: turnLevel,
    liveCheck: false,
    detailCodes: turnCodes,
  });

  // —— Google OAuth (env only; login flow is separate) ——
  const gOk = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
  items.push({
    id: 'google_oauth',
    level: gOk ? 'ok' : 'info',
    liveCheck: false,
    detailCodes: gOk ? ['configured'] : ['email_only'],
  });

  // —— Hosting hint (no probe) ——
  items.push({
    id: 'hosting',
    level: vercel ? 'ok' : 'info',
    liveCheck: false,
    detailCodes: vercel ? ['vercel_detected'] : ['not_vercel_env'],
  });

  // —— Checklog edge mutation logging ——
  const mutationOff = process.env.CHECKLOG_MUTATION_LOG_ENABLED === 'false';
  items.push({
    id: 'checklog_edge',
    level: mutationOff ? 'warn' : 'ok',
    liveCheck: false,
    detailCodes: mutationOff ? ['mutation_log_disabled'] : ['mutation_log_enabled'],
  });

  return {
    checkedAt: new Date().toISOString(),
    nodeEnv,
    vercel,
    items,
  };
}
