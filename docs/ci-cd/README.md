# CI/CD Status (Expo + EAS)

## Scope

This folder documents the current mobile CI/CD direction for Take Me Pic and records what has already been completed in backend readiness.

## Command Reference

Use `docs/ci-cd/commands-reference.md` for all operational commands:

- local development
- local quality checks
- Maestro E2E execution
- EAS build and submit flows
- manual EAS workflow runs

Local-first policy: execute local validation/build commands first and use EAS workflows for shared verification and releases to control credit consumption.

## What Was Completed

### Supabase backend readiness

- Target project verified: `oxexcljzzemfenzogcnz`.
- Initial schema is applied remotely.
- Runtime verification confirms:
  - 33 `public` tables
  - RLS enabled on schema tables
  - `find_available_helpers` exists
  - `accept_help_request` exists and is executable by `authenticated`
- Local migration sync includes:
  - `supabase/migrations/0001_initial_schema.sql`
  - `supabase/migrations/0002_accept_help_request_rpc.sql`

### Documentation/handoff sync

- `docs/SUPABASE-INTEGRATION-STATUS.md` updated to reflect live schema state.
- `handoff/nextjs-admin/README.md` updated to reflect schema pass and RPC availability.
- `handoff/nextjs-admin/schema-check-report.md` updated to pass status with current runtime checks.
- `handoff/nextjs-admin/specs-snapshot.md` updated to reflect implemented `accept_help_request`.

## CI/CD Platform Recommendation

Use Expo-native release automation:

- EAS Build for reproducible iOS/Android builds.
- EAS Submit/TestFlight distribution for iOS.
- EAS Workflows for orchestration.
- Maestro for mobile E2E flows executed in EAS Workflows.
- Optional GitHub Actions for repo-level checks (lint/type/tests), with mobile distribution remaining in EAS.

## E2E Testing Standard

Use Maestro as the default E2E framework for Expo/React Native.

- Store task flows in `.maestro/tasks/` (for example: `TASK-001.yml`, `TASK-002.yml`).
- Run flows locally on dev client builds during feature work.
- Run the same flows in CI on pull requests using EAS Workflows `type: maestro`.
- Keep E2E flows focused on critical paths only (auth, onboarding, core tab navigation).

### Suggested E2E Build Profile

Add a dedicated profile in `eas.json`:

- `build.e2e-test.ios.simulator = true`
- `build.e2e-test.android.buildType = apk`
- `build.e2e-test.withoutCredentials = true` for CI-only simulator/emulator flows

### Suggested Workflow Files

- `.eas/workflows/e2e-test-android.yml`
- `.eas/workflows/e2e-test-ios.yml`
- `.eas/workflows/submit-ios.yml`
- `.eas/workflows/submit-android.yml`

E2E workflows should:

1. Build using profile `e2e-test`
2. Run maestro job with `flow_path` targeting `.maestro/tasks/*.yml`
3. Trigger on pull requests

Submit workflows should:

1. Build using profile `production`
2. Submit to TestFlight/Play with release-owner control
3. Trigger on `workflow_dispatch`

## Current Build Profile Shape

From `eas.json`:

- `development`: development client, internal distribution.
- `preview`: internal distribution.
- `production`: release profile with auto-increment.

## Next Actions

1. Add explicit submit metadata in `eas.json` for fully non-interactive store submissions.
2. Enforce release gates (lint/type/test + Maestro smoke + auth/session smoke + schema sanity).
3. Add build notifications for success/failure.
4. Start phased replacement of mock-backed data paths with Supabase-backed services.
