# TASK-001 — Wire Supabase Auth Shell and Route Gate

Status: Ready
Priority: P0
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP — Auth first
Owner: Agent

## Purpose

Connect the existing authentication UI to Supabase Auth and route users based on session plus profile completion without changing the approved screen design.

## Scope

- Wire `LoginScreen`, `SignupScreen`, `OtpScreen`, `ForgotPasswordScreen`, and `ResetPasswordScreen` to existing auth hooks/API.
- Ensure `AuthProvider` exposes loading, authenticated, session, and user state reliably.
- Add an app-entry gate: unauthenticated users go to onboarding, authenticated users missing profile go to profile setup, complete users go to tabs.
- Replace demo navigation and hard-coded OTP behavior with Supabase-backed flows.
- Add loading/error/success states where the UI currently uses mock/local behavior.
- Keep secrets out of the app; use only Expo public Supabase env values.

## User Flow

User opens onboarding

↓

User signs up or logs in

↓

Supabase Auth returns or verifies a session

↓

App stores session state in `AuthProvider`

↓

User can continue to profile setup or main app depending on profile state

## Acceptance Criteria

- [ ] Login submits credentials to Supabase and surfaces useful inline errors.
- [ ] Signup starts the Supabase account flow and prevents duplicate submits.
- [ ] OTP/password reset flows call Supabase and handle invalid/expired code states.
- [ ] OTP verification no longer accepts the hard-coded demo code.
- [ ] Logout clears session and returns the user to the auth/onboarding path.
- [ ] Restarting the app restores an existing Supabase session.
- [ ] App-entry routing sends users to the right place based on auth/profile state.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Use `src/features/auth/api/auth-api.ts`.
- Use existing hooks under `src/features/auth/hooks`.
- Use `src/shared/lib/supabase/auth.ts` for Supabase calls.
- Do not authorize from `user_metadata`.

## Edge Cases

- Invalid email/password.
- Duplicate email.
- Network timeout.
- Expired OTP.
- Session exists but profile row is missing.

## Dependencies

- Supabase URL and publishable key in `.env`.
- Supabase Auth provider settings configured in the remote project.

## Verification

- Manual happy-path signup/login/logout.
- Manual invalid credential and expired-code path.
- Typecheck.

## Test Scope

- Static: TypeScript compile safety for task changes.
- E2E smoke: auth login route and onboarding-to-auth entry coverage.
- Manual: invalid credentials, expired OTP, and session restore edge checks.

## Test Commands

- `npm run typecheck`
- `maestro test .maestro/tasks/TASK-001.yml`

## CI Mapping

- Workflow: `.eas/workflows/e2e-test-android.yml`
- Workflow: `.eas/workflows/e2e-test-ios.yml`
- Required flow path: `.maestro/tasks/TASK-001.yml`

## Pass Criteria

- [ ] Local `npm run typecheck` passes.
- [ ] Local `maestro test .maestro/tasks/TASK-001.yml` passes.
- [ ] Android E2E workflow passes with `TASK-001` flow included.
- [ ] iOS E2E workflow passes with `TASK-001` flow included.
- [ ] Verification evidence attached (run IDs or screenshots).
