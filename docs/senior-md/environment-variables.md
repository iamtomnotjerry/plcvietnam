# Environment Variables

Canonical reference is `.env.example`.

## Rules

- Keep production secrets server-side only.
- Do not expose service-role credentials to client bundles.
- Validate required server variables at startup for critical services.

## Core Variables (examples)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL` (required in production)
- `UPSTASH_REDIS_REST_TOKEN` (required when Upstash URL is set)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (required together with Turnstile secret)
- `TURNSTILE_SECRET_KEY` (required together with Turnstile site key)
- OAuth provider keys when enabled
- `CHECKLOG_MUTATION_LOG_ENABLED` — when set to `false`, middleware stops inserting generic HTTP mutation rows into `checklog_events` (default / omitted: enabled). See `docs/senior-md/api-contracts.md` (Checklog).

## Operational Guidance

- Treat `SUPABASE_SERVICE_ROLE_KEY` as mandatory for privileged server operations.
- Fail fast on missing required secrets in privileged paths.
- Keep per-environment values in secret managers, not committed files.

## Upstash Redis (rate limiting)

- Use the **REST URL** and **REST token** from the Upstash console (Redis → **Details**). The token is not the same as an old database password if you rotated credentials.
- If Vercel logs show `WRONGPASS` / `invalid or missing auth token` on `/api/auth/*`, `UPSTASH_REDIS_REST_TOKEN` in the deployment does not match that Upstash database. Update the env var and redeploy.
- Runtime behavior: if Redis returns an error, `lib/rate-limit.ts` falls back to **in-memory** limits per instance so users are not blocked with a false “too many requests” while you fix credentials (multi-instance still benefits from fixing Upstash).
