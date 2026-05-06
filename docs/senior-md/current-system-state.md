# Current System State

This document is the operational source-of-truth snapshot for codebase behavior and conventions.
Update this file whenever API contracts, security posture, or architecture behavior changes.

## Last Updated

- Date: 2026-05-06
- Scope: API/admin hardening, frontend a11y/fetch consistency, validation contract fixes, docs+ops expansion

## API Contract Status

- Error responses are standardized across admin and most non-admin routes via `lib/api/responses.ts`.
- Error payload shape:
  - `{ "error": { "code": "<ERROR_CODE>", "message": "<message>" } }`
- Standard codes currently in use:
  - `UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`
- `429` responses now support standardized rate-limit headers through `apiTooManyRequests(...)`.

## Security Posture Updates

- Service-role fallback to anon key has been removed in privileged paths.
- Admin routes now enforce route-level role checks (defense-in-depth), not only middleware.
- `GET /api/admin/fields` now enforces `admin` role before data access.
- Upload endpoint validates file type/size and sanitizes upload path.
- Upload endpoint now restricts provided path prefix to `uploads/{userId}/...` and storage write uses `upsert: false`.
- Reset password endpoint no longer exposes raw internal error text.

## Reliability and Maintainability Updates

- Centralized environment validation in `lib/env.ts`.
- Core infra modules now read validated env:
  - `lib/supabase/client-singleton.ts`
  - `lib/supabase/storage.ts`
  - `lib/rate-limit.ts`
- Test-safe env defaults are provided only for `NODE_ENV=test`.
- Data provider factory now defaults to `supabase` outside test; test environment defaults to `mock`.
- Admin fields/comments routes use singleton service client instead of ad-hoc client creation.

## Frontend Quality Updates

- Navigation tree semantics improved:
  - expandable nodes use `button` semantics
  - `aria-expanded` and `aria-controls` added
- Navigation fetch no longer forces `no-store`, allowing route cache policy to apply.
- Mobile search overlay now restores focus and traps focus while dialog is open.
- Post delete flow in `PostDetail` now uses inline error surface instead of blocking alert popup.

## Documentation Baseline

Core docs are present for senior-level onboarding and operations:

- `README.md`
- `CONTRIBUTING.md`
- `docs/senior-md/architecture-overview.md`
- `docs/senior-md/testing-strategy.md`
- `docs/senior-md/environment-variables.md`
- `docs/senior-md/deployment-runbook.md`
- `docs/senior-md/incident-runbook.md`
- `docs/senior-md/onboarding.md`
- `docs/senior-md/observability-runbook.md`
- `docs/senior-md/api-contracts.md`
- `docs/senior-md/current-system-state.md` (this file)

## Known Remaining Gaps (Next Priorities)

- Expand API contract tests for additional admin routes (`reorder`, `upload`, `users`, `posts` PATCH/DELETE edge cases).
- Add request correlation IDs and structured log schema in runtime code.
- Move multi-step post/tag mutations to transactional DB flow (RPC/transaction).
