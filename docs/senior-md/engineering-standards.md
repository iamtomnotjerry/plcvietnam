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
