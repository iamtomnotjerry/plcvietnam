# Agent Strict Rules

These rules are mandatory for any AI agent operating on this repository.

## 1) Mandatory Read Before Edit

- Read this folder first.
- Read target files fully before modifying them.
- Read related call sites for any changed API/type/interface.

## 2) Change Discipline

- Make surgical changes only.
- Do not refactor unrelated code in the same patch.
- Do not introduce speculative abstractions.
- Keep diffs small, reviewable, and requirement-driven.

## 3) Validation Gates

- After meaningful edits, run:
  - `npm run lint`
  - `npm run type-check`
  - relevant tests (or `npm test` for broad changes)
- Do not declare completion without verification output.

## 4) Quality Constraints

- No `any` in production paths unless there is a justified boundary cast.
- No silent behavior changes.
- No swallowing errors without logging context.
- No secret leakage in code, logs, or docs.

## 5) Documentation Policy

- Keep docs in one place (`docs/senior-md`).
- Avoid temporary reports and duplicated guidance.
- Update docs only when behavior/contracts actually change.
- For any API contract, auth, env, or security behavior change, update `current-system-state.md` in the same patch.
