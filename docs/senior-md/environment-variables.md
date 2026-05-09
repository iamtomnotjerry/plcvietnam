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

## Operational Guidance

- Treat `SUPABASE_SERVICE_ROLE_KEY` as mandatory for privileged server operations.
- Fail fast on missing required secrets in privileged paths.
- Keep per-environment values in secret managers, not committed files.
