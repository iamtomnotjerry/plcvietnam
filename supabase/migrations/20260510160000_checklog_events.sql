-- Checklog: persisted audit + HTTP mutation traces (admin-readable via API only; service role writes)

CREATE TABLE public.checklog_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL,
  channel TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('edge', 'server')),
  http_method TEXT,
  path TEXT,
  query_redacted TEXT,
  status_code INTEGER,
  actor_user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  email_hash TEXT,
  ip TEXT,
  user_agent TEXT,
  request_id TEXT,
  outcome TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX checklog_events_created_at_idx ON public.checklog_events (created_at DESC);
CREATE INDEX checklog_events_category_idx ON public.checklog_events (category);
CREATE INDEX checklog_events_channel_idx ON public.checklog_events (channel);
CREATE INDEX checklog_events_actor_idx ON public.checklog_events (actor_user_id);
CREATE INDEX checklog_events_path_idx ON public.checklog_events (path);

ALTER TABLE public.checklog_events ENABLE ROW LEVEL SECURITY;

-- No policies: anon/authenticated cannot read or write; service_role bypasses RLS.

COMMENT ON TABLE public.checklog_events IS 'Security and mutation logs; insert via server service role only.';
