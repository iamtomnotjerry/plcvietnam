# Engineering Standards

## 1) Design Principles

- Prefer simple and explicit code over clever abstractions.
- Keep modules cohesive and small; one reason to change per module.
- Separate domain logic, transport (API), and UI concerns.
- Avoid hidden side effects and implicit global coupling.

## 2) Type Safety

- Use strict TypeScript types end-to-end for production paths.
- Avoid `any` in production code.
- Validate unknown input at boundaries (API requests, external data, environment).
- Keep domain types centralized and reuse them across features.

## 3) API and Data Layer

- Keep data access behind repository/provider boundaries.
- Keep API handlers thin: validate input, call service/repository, map output.
- Return stable response shapes and explicit error payloads.
- Keep migration and schema changes backward-compatible when possible.

## 4) Frontend Patterns

- Keep components focused and composable.
- Derive UI state from source-of-truth data when possible.
- Avoid duplicate fetching patterns; centralize query logic in hooks/services.
- Ensure accessibility attributes are complete for interactive controls.

## 5) Error Handling and Observability

- Log errors with meaningful context (operation, entity, relevant ids).
- Never leak secrets or sensitive payloads to logs.
- Prefer fail-safe defaults for security-sensitive flows.
- Keep monitoring hooks lightweight and non-blocking.

### Integrations status (admin UI)

- The `/integrations` page and `GET /api/admin/integrations-status` are **read-only** health snapshots: extend checks in `lib/integrations/run-integration-health-checks.ts`, keep types in `lib/integrations/types.ts`, and add or adjust user-facing copy in `messages/integrations/*` (and `i18n/load-messages.ts` if namespaces change). Do not return secrets or raw env values; prefer boolean/safe codes only.

### Architecture page (admin UI)

- The `/architecture` page is **documentation-only** in the app: keep copy in `messages/architecture/*` aligned with real dependencies (`package.json`) and repo layout. Update `docs/senior-md/architecture-overview.md` or `current-system-state.md` when the described behavior or gates change materially.

### Admin CMS list UI

- Prefer **`features/admin/components/AdminDataTable`** for admin tabular screens; use **`serverToolbarSearch`** when the list is server-paginated (e.g. posts + URL `q`) and **`enableGlobalFilter`** for client-only filtering. Do not pass `LucideIcon` constructors from Server Components into **`AdminCmsPageHero`** — pass rendered icon JSX. When changing default page size, pagination options, search behavior, or loading UX, update **`docs/senior-md/current-system-state.md`** and **`messages/architecture/*`** if the architecture page mentions those layers.

### Checklog (audit trail)

- New or changed **mutating** `app/api/admin/*` handlers should record successful operator actions via `logAdminChecklogEvent` unless the action is already fully covered by another persisted channel (avoid duplicate rows for the same user action).
- Use a **dotted channel name** and small **metadata** (ids, slugs, enums)—no passwords, tokens, or full upload paths unless explicitly required.
- Keep human-readable copy for the Checklog UI in `messages/*/checklog` (`human.channels.*`) when adding channels.

## 6) Testing Standards

- Unit-test pure logic and edge cases.
- Component-test critical interaction paths.
- API-test contract and validation behavior.
- Keep tests deterministic; mock external systems consistently.

## 7) Review Checklist

- Does each changed line map to a clear requirement?
- Is the behavior verified by lint, type-check, and tests?
- Is the change easy to read for a new maintainer?
- Is there any avoidable complexity that can be removed?
