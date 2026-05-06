# Testing Strategy

## Scope

- Unit tests: pure functions and critical utility logic.
- Component tests: interaction and rendering behavior for critical UI.
- API tests: request validation, authz, and response contracts.

## Required for PR

- Run `npm run type-check`, `npm run lint`, and relevant test suites.
- For wide-impact changes, run `npm run validate`.

## Test Placement

- Keep tests near code when practical (`*.test.ts`, `*.test.tsx`).
- Prefer feature-level tests under `features/*` and route tests under `app/api/*`.

## Principles

- Tests must be deterministic and isolated.
- Mock external services consistently.
- Assert behavior/output contracts, not implementation details.
