# Incident Runbook

## Severity

- Sev1: major outage or data/security risk.
- Sev2: major feature degraded with workaround.
- Sev3: minor degradation with low business impact.

## Response Flow

1. Triage symptoms and blast radius.
2. Stabilize service (feature flag, rollback, temporary rate limit).
3. Communicate status and next update time.
4. Capture timeline and root cause evidence.

## Minimum Data to Capture

- First detection time
- Impacted routes/features
- Error signatures/log context
- Mitigation actions and timestamps

## Post-Incident

- Publish short RCA with action items.
- Add tests/guards to prevent recurrence.
