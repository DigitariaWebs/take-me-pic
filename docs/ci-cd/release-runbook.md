# Release Runbook (Expo + EAS)

## Goals

- Keep mobile releases repeatable.
- Keep signing credentials controlled.
- Ship TestFlight/internal builds automatically.
- Keep EAS credit usage intentional with a local-first validation policy.

Primary command list: `docs/ci-cd/commands-reference.md`.

## Roles

- **Release owner**: triggers production workflows and validates checklist.
- **Credential owner**: maintains Apple/Google signing and API access.
- **QA owner**: validates release candidate behavior on physical devices.

## Credential Handling

### iOS

- Prefer EAS-managed credentials for build signing.
- Use App Store Connect API key for CI submissions.
- Keep API credentials in secure CI secrets only.

### Android

- Prefer EAS-managed signing keys for build automation.
- Use Play App Signing in Google Play Console for production path.
- Keep keystore/admin secrets in secure CI secret storage.

## Release Stages

### Stage 1: Development

- Build profile: `development`.
- Distribution: internal.
- Purpose: engineering validation with development client.

### Stage 2: QA/Preview

- Build profile: `preview`.
- Distribution: internal testers.
- Purpose: stable build validation on real devices.

### Stage 3: Production Candidate

- Build profile: `production`.
- iOS destination: TestFlight (internal first, then external if approved).
- Android destination: internal distribution or internal testing track.

## Local-First Credit Policy

- Local development and validation should run before any cloud workflow:
  - `npm run typecheck`
  - local app run (`npm run ios`/`npm run android`)
  - local Maestro smoke where applicable
- EAS cloud workflows are reserved for:
  - pull request E2E evidence on shared branches
  - production release build + store submission
- Release owner is accountable for avoiding redundant reruns that do not add signal.

## Required Gates Before Production

1. Lint/type/test checks pass.
2. Maestro E2E smoke workflows pass on iOS and Android.
3. Auth session lifecycle smoke-tested (sign-in, restore, sign-out).
4. Backend schema sanity check passes for required tables/RPCs.
5. QA sign-off recorded.

## E2E Automation Standard

- Framework: Maestro
- Flow folder: `.maestro/tasks/`
- CI orchestrator: EAS Workflows
- Required workflows:
  - `.eas/workflows/e2e-test-android.yml`
  - `.eas/workflows/e2e-test-ios.yml`
  - `.eas/workflows/submit-ios.yml`
  - `.eas/workflows/submit-android.yml`
- Build profile used by E2E workflows: `e2e-test`

Release owner must confirm the latest successful E2E workflow run IDs before promoting to production.

## Rollback Plan

1. Stop rollout in TestFlight/internal channel.
2. Promote previous known-good build for testers.
3. Open incident note with root cause and affected version.
4. Patch and rerun pipeline with hotfix branch.

## Audit Log Per Release

Record per release:

- Git SHA
- EAS build IDs (iOS/Android)
- submit destination
- triggered by
- timestamp
- release notes link
