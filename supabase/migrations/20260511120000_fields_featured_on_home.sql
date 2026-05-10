-- Homepage "Lĩnh vực" section: mark fields as featured (max 6 flagged; display picks featured first, then newest by created_at).

ALTER TABLE public.fields
ADD COLUMN IF NOT EXISTS featured_on_home BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.fields.featured_on_home IS 'Eligible for homepage fields section; at most 6 may be true; section shows up to 6 (featured first by created_at desc, then backfill).';

CREATE INDEX IF NOT EXISTS idx_fields_featured_on_home ON public.fields (featured_on_home)
WHERE featured_on_home = true;
