# Senior Engineering Docs

This folder is the single documentation source for engineering standards in this repository.

## Goals

- Keep the codebase maintainable with clear boundaries and predictable patterns.
- Keep the system scalable by design (data access, caching, rendering, and API contracts).
- Keep delivery quality high via strict validation gates and consistent review criteria.

## Documents

- `engineering-standards.md`: coding standards, architecture boundaries, and review checklist.
- `scalability-and-operations.md`: scale strategy, reliability patterns, and production readiness.
- `agent-strict-rules.md`: mandatory rules for AI agents and automation tools.
- `architecture-overview.md`: project-specific module boundaries and request/data flow.
- `testing-strategy.md`: mandatory test scope and quality gate policy.
- `environment-variables.md`: env contract and secret handling rules.
- `deployment-runbook.md`: deployment, verification, and rollback steps.
- `incident-runbook.md`: incident triage and response process.
- `observability-runbook.md`: logging, alerting, and troubleshooting baseline.
- `api-contracts.md`: canonical API error envelope and route contract rules.
- `onboarding.md`: new engineer setup and first PR expectations.
- `current-system-state.md`: current code/contract snapshot for new sessions and onboarding continuity.

## Non-Goals

- No temporary status reports.
- No duplicate docs across multiple folders.
- No speculative guidance without direct implementation value.
