# API Contracts

This document defines the baseline API response contract and route-level expectations.

## Response Envelope

- Success responses return route-specific payloads.
- Error responses must use:
  - `{ "error": { "code": "<ERROR_CODE>", "message": "<message>" } }`

Implemented via `lib/api/responses.ts`.

## Standard Error Codes

- `UNAUTHORIZED`
- `FORBIDDEN`
- `BAD_REQUEST`
- `NOT_FOUND`
- `CONFLICT`
- `TOO_MANY_REQUESTS`
- `INTERNAL_ERROR`

## Rate Limit Contract

When a request is throttled (`429`), the response should include:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

Use `apiTooManyRequests(message, { limit, remaining, reset })` to keep this consistent.

### Auth routes (implemented in `lib/rate-limit.ts`)

| Route                                | Limiters (identifiers)                                              | Notes                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/sign-in`             | `auth` (IP), `auth` (`signin:{ip}:{emailHash}`)                     | Layered                                                                                                     |
| `POST /api/auth/register`            | `auth` (IP), `auth` (`signup:{ip}:{emailHash}`)                     | Anti spray                                                                                                  |
| `POST /api/auth/forgot-password`     | `auth` (IP), **`forgotResend`** (`forgot-resend:{ip}:{emailHash}`)  | **429** if same identity within **60s**                                                                     |
| `POST /api/auth/resend-confirmation` | `auth` (IP), **`forgotResend`** (`confirm-resend:{ip}:{emailHash}`) | **429** if same identity within **60s**; response always `{ ok: true }` when valid input (anti-enumeration) |
| `POST /api/auth/reset-password`      | `auth` (`{ip}:reset-password`)                                      | Per-IP cap on reset attempts                                                                                |

Exact windows: **`auth`** = 10 requests / 15 minutes (memory or Upstash); **`forgotResend`** = 1 / 60s per key.

## Route Guard Baseline

- `/api/admin/*` routes require role checks in each handler (defense-in-depth).
- Mutating admin routes must apply rate limiting.
- Input from request body/query params must be validated at route boundaries.

## Checklog (admin audit)

Admin-only operational audit trail. Canonical behavior snapshot: `current-system-state.md` (Last Updated).

| Route                              | Role    | Notes                                                                                                                                                                                                               |
| ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/checklog`          | `admin` | Paginated list; query: `limit`, `offset`, `category`, `channel` (exact), `channelSearch` (ILIKE substring, sanitized), `pathPrefix`, `outcome`, `actorUserId` (UUID), `from` / `to` (`YYYY-MM-DD`, UTC day bounds). |
| `GET /api/admin/checklog/stats`    | `admin` | Counts by category; query: `from`, `to` (same date format).                                                                                                                                                         |
| `POST /api/checklog/session-event` | Session | Sign-out / OAuth callback events (allowlisted actions).                                                                                                                                                             |

**Persistence:** table `checklog_events` (Supabase). **Edge HTTP mutations:** middleware → `logChecklogMutationFromMiddleware` (disable with `CHECKLOG_MUTATION_LOG_ENABLED=false`). **Auth:** `logAuthAudit` → `recordChecklogEvent`. **CMS mutations:** after successful mutating handler, call `logAdminChecklogEvent` from `lib/checklog/log-admin-event.ts` with a stable dotted `channel` (e.g. `posts.update`). **Do not** log high-noise paths already excluded in middleware (e.g. post view counter).

**UI:** locale route `/checklog`, middleware-gated to admins. Client: `features/checklog/`.

## Integrations status (admin)

Read-only operational snapshot for third-party connectivity (not part of Checklog persistence).

| Route                                | Role    | Notes                                                                                                                        |
| ------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/integrations-status` | `admin` | Env checks + light probes (`runIntegrationHealthChecks`); response must not include secrets or vendor billing/usage figures. |

**UI:** locale route `/integrations`, middleware-gated to admins (same pattern as `/checklog`). Client: `features/integrations/`; copy: `messages/integrations/*`; health logic: `lib/integrations/`.

## Public content read (snapshot)

| Route           | Notes                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/tags` | JSON array of tag objects (`id`, `slug`, `name`, `postCount` per domain type). ISR ~1h (`revalidate` in route). Sidebar tag mode (`NavigationTagList`) and other clients may consume. |

## Versioning Rule

- Non-backward-compatible API changes require:
  - client call site update in the same patch
  - test updates in the same patch
  - `current-system-state.md` update in the same patch
