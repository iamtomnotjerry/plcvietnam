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

## Route Guard Baseline

- `/api/admin/*` routes require role checks in each handler (defense-in-depth).
- Mutating admin routes must apply rate limiting.
- Input from request body/query params must be validated at route boundaries.

## Versioning Rule

- Non-backward-compatible API changes require:
  - client call site update in the same patch
  - test updates in the same patch
  - `current-system-state.md` update in the same patch
