# Contributing

## Branch and PR

- Create a feature branch from the default branch.
- Keep each PR scoped to one concern.
- Include problem statement, solution summary, and test evidence in PR description.

## Local Verification (required)

Run before opening or updating a PR:

- `npm run type-check`
- `npm run lint`
- `npm run test`

For broad changes, run:

- `npm run validate`

## Code Change Rules

- Keep changes surgical and requirement-driven.
- Avoid unrelated refactors in the same PR.
- Maintain strict TypeScript safety; avoid `any` in production paths.
- Validate API boundary input with schemas.
- If behavior/contracts change (API/auth/env/security), update `docs/senior-md/current-system-state.md` in the same PR.

## Tests

- Add or update tests when behavior changes.
- Prefer deterministic tests; mock external systems consistently.
