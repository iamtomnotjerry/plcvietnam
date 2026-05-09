# Architecture Overview

## System Shape

- Next.js App Router serves both UI routes and API routes.
- Locale-first UI lives under `app/[locale]/` with **`next-intl`** (`i18n/routing.ts`, `i18n/request.ts`, message catalogs in `messages/`).
- `features/*` holds feature-specific UI, hooks, and local logic.
- `components/*` holds cross-feature reusable UI components.
- `app/api/*` holds HTTP transport handlers and boundary validation.
- `lib/data/*` holds repository/provider abstractions for data access.

## Data Layer Boundaries

- Route handlers should validate input, call repository/provider, and map stable responses.
- Domain/data access logic should stay in `lib/data/providers/*`.
- Keep transport logic out of provider internals.

## Auth and Access

- Auth is unified on Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`).
- Middleware protects `/admin` and `/api/admin` paths.
- Sensitive admin handlers should also enforce route-level role checks (defense in depth).

## Non-Functional Goals

- Strict TypeScript in production paths.
- Stable response contracts for frontend integrations.
- Clear logging/monitoring hooks for failure diagnosis.
