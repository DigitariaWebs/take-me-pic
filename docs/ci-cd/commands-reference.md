# CI/CD Commands Reference (Expo + EAS)

Use this page as the single source of truth for development, test, E2E, and deployment commands.

## 1) Prerequisites

Install dependencies and authenticate EAS once per machine:

```bash
npm install
npx eas login
```

Optional version checks:

```bash
npx expo --version
npx eas --version
```

## 2) Local Development

Start the app:

```bash
npm run start
```

Native run commands:

```bash
npm run ios
npm run android
```

Web run (optional):

```bash
npm run web
```

## 3) Local Quality Gates

Current required static check:

```bash
npm run typecheck
```

Project policy for credit usage:

- prefer local `typecheck`, local dev-client builds, and local Maestro first
- run EAS cloud workflows for shared PR evidence and release operations only

## 4) E2E Testing (Maestro)

Maestro is the default E2E framework for this project.

Install Maestro CLI:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
maestro --version
```

Run local E2E flows (examples):

```bash
maestro test .maestro/auth_login.yml
maestro test .maestro/auth_signup.yml
maestro test .maestro/onboarding_profile.yml
```

Run all flows in `.maestro`:

```bash
maestro test .maestro
```

Run task-scoped flows:

```bash
maestro test .maestro/tasks/TASK-001.yml
maestro test .maestro/tasks/TASK-002.yml
```

## 5) EAS Build Commands

### Development profile (`development`)

Use for dev-client engineering validation.

```bash
npx eas build --platform ios --profile development
npx eas build --platform android --profile development
```

### QA profile (`preview`)

Use for internal QA/testing binaries.

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

### Production profile (`production`)

Use for release candidate/store-grade builds.

```bash
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

## 6) Submission/Distribution Commands

Submit latest iOS production build to TestFlight:

```bash
npx eas submit --platform ios --profile production --latest
```

Build and auto-submit iOS production in one step:

```bash
npx eas build --platform ios --profile production --auto-submit
```

## 7) EAS Workflow Commands

Run workflows manually:

```bash
npx eas workflow:run .eas/workflows/e2e-test-android.yml
npx eas workflow:run .eas/workflows/e2e-test-ios.yml
npx eas workflow:run .eas/workflows/submit-ios.yml
npx eas workflow:run .eas/workflows/submit-android.yml
```

Expected workflow behavior:

- `pull_request` trigger runs E2E checks automatically
- workflows build with `e2e-test` profile
- workflows execute Maestro flows from `.maestro/`
- submit workflows are release-owner only and run manually (`workflow_dispatch`)

## 8) Release Operator Command Set

Use this sequence for production release operations:

```bash
npm run typecheck
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
npx eas workflow:run .eas/workflows/submit-ios.yml
npx eas workflow:run .eas/workflows/submit-android.yml
```

Before final promotion, confirm:

1. latest iOS + Android Maestro E2E workflows passed
2. auth lifecycle smoke checks passed
3. QA sign-off recorded
