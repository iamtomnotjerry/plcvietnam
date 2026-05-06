# Deployment Runbook

## Pre-Deploy Checklist

- `npm run type-check`
- `npm run lint`
- `npm run test`
- Verify required environment variables are configured.

## Deploy Steps

1. Merge reviewed PR to deployment branch.
2. Trigger build/deploy in target platform.
3. Verify health of critical pages and admin APIs.

## Post-Deploy Verification

- Smoke-check homepage, posts listing, and admin login.
- Verify at least one write path (admin create/update) in non-destructive way.
- Check logs for elevated error rate.

## Rollback

- Roll back to previous known-good release on failed smoke checks or elevated errors.
- Re-run smoke checks after rollback to confirm recovery.
