# Observability Runbook

This runbook defines baseline observability expectations for operations and incident response.

## Logging Contract

- Log operational failures with context:
  - operation name
  - entity type and id when available
  - sanitized error details
- Never log secrets, tokens, or full sensitive payloads.
- Use stable log prefixes for API handlers (example: `[api/admin/posts PATCH]`).

## Minimum Signals

- Application errors by endpoint
- 4xx/5xx rates
- Rate-limit rejection count (`429`)
- Auth failures (`401`)
- Request latency p95 for public and admin APIs

## Alerting Baseline

- Trigger alerts for:
  - sustained 5xx spikes
  - sudden auth failure spikes
  - repeated upload/storage failures
- Every alert must include:
  - severity
  - impacted endpoint/service
  - first seen timestamp

## Triage Steps

1. Identify impacted route/feature from logs and alert metadata.
2. Check latest deploy and config changes.
3. Confirm error pattern and blast radius.
4. Apply mitigation (rate-limit tighten, rollback, temporary route disable, hotfix).
5. Document incident timeline and remediation tasks.

## Post-Incident Requirements

- Add or update tests to prevent recurrence.
- Update `current-system-state.md` for behavior/contract changes.
- Record follow-up tasks for missing instrumentation.
