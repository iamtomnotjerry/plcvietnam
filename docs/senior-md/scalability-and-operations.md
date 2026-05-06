# Scalability and Operations

## 1) Scalability Strategy

- Build for read-heavy paths first (caching, pagination, selective queries).
- Keep database queries explicit and indexed for common filters/sorts.
- Prefer batched requests and avoid N+1 query patterns.
- Keep payloads minimal; return only fields needed by the client.

## 2) Runtime Efficiency

- Avoid unnecessary client-side state churn and re-renders.
- Use memoization only where profiling shows value.
- Keep expensive transforms close to data boundaries and cache reusable results.
- Keep bundle size lean by avoiding unused imports and dead code.

## 3) Reliability and Fault Tolerance

- Validate all external and user-provided input.
- Fail gracefully with meaningful user-safe errors.
- Apply rate limits to abuse-prone endpoints.
- Keep retries bounded and idempotent when used.

## 4) Deployment and Environment

- Enforce strict CI gates:
  - `lint` must pass
  - `type-check` must pass
  - tests must pass
- Keep environment variable contracts explicit and validated on startup.
- Keep production-only secrets server-side only.

## 5) Maintainability at Scale

- Keep folder structure stable and feature-oriented.
- Keep docs concise and centralized; avoid duplicate files.
- Keep coding conventions consistent across teams and tools.
- Keep refactors incremental, with verification after each batch.
