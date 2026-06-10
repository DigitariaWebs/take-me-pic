# Pipeline Matrix

Operational commands for this matrix are documented in `docs/ci-cd/commands-reference.md`.

## Branch Strategy

| Branch | Purpose | Build Profile | Output | Distribution |
|---|---|---|---|---|
| `feature/*` | Dev validation | `development` (optional/manual) | Dev client build | Engineers only |
| `develop` | Integration QA | `preview` | Installable QA binaries | Internal testers |
| `main` | Release candidate | `production` | Store-grade binaries | TestFlight internal + Android internal |
| `hotfix/*` | Urgent fix validation | `preview` -> `production` | RC/hotfix binaries | Targeted internal groups |

## Recommended Job Flow

1. **Checks**
   - Install dependencies
   - lint
   - typecheck
   - tests
   - Maestro E2E smoke flows (`.maestro/tasks/*`)
2. **Build**
   - EAS build for target platform/profile
3. **Distribute**
   - iOS to TestFlight internal
   - Android to internal distribution channel
4. **Notify**
   - send result to team channel

## E2E Workflow Standard (PR)

- Use EAS Workflows with `type: maestro` for mobile E2E automation.
- Build profile: `e2e-test`.
- Run on both platforms:
  - Android workflow: build `.apk` then run Maestro flows.
  - iOS workflow: build simulator `.app` then run Maestro flows.
- Trigger: `pull_request` on all active branches.

### Minimum Required Maestro Flows

1. Login flow (existing account)
2. Signup/verification entry flow
3. Profile completion and redirect to main tabs

## Test Destinations (Non-Store)

### iOS

- TestFlight internal groups via EAS testflight job.

### Android

Choose one primary destination:

1. EAS internal distribution links (fastest setup), or
2. Firebase App Distribution (better tester/group management), or
3. Google Play internal testing track (closest to store behavior).

## Promotion Rules

- `preview` builds never auto-promote to production.
- `production` submission requires gate checks and manual approval.
- External TestFlight groups only after internal pass.
