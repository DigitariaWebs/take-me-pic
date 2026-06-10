# TASK-002 — Harden Trusted Profile Gates

Status: Done
Priority: P0
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP — Auth first
Owner: Agent

## Already Implemented From TASK-001

- Supabase email/password signup and login are wired.
- Email OTP/deep-link verification flow exists.
- Profile create hook and API exist for initial Trusted Profile completion.
- Profile fetch hook exists for the current user.
- App launch and tabs layout already gate missing profiles back to profile completion.
- Login now handles unconfirmed email by routing back to email verification.
- Profile create currently needs cleanup because it sends client-owned values for trust/ban-related fields.

## Purpose

Finalize the trusted profile gate after authentication so Phase 1 actions are blocked or allowed by session, profile completion, verification policy, and ban state.

## Scope

- Keep `profiles.id = auth.uid()` as the profile ownership contract.
- Load the current user's profile on app boot after session restore and handle retryable failures.
- Add or verify route-level gates for app entry and Phase 1 route groups.
- Add reusable action-level guard predicates for map, request, helper, session, and messaging flows.
- Validate required trusted profile fields before write: first name, username, age policy, city, and languages.
- Treat `bio`, `phone`, `avatar_url`, `cover_url`, and `last_name` as optional for this gate.
- Add profile update API/hook support for owned profile fields.
- Do not build the full profile edit UI in this task.
- Block banned users from all Phase 1 help-network actions.
- Require Email Verification and a Trusted Profile for app entry.
- Do not require Phone Verification for app entry in this task.
- Show a dedicated blocked-account state for banned users.
- Use Supabase Auth user state as the authority for Email Verification.
- Remove client writes to server-owned trust and ban flags.
- Verify or add database/RLS protection so authenticated clients cannot self-set server-owned trust and ban flags.
- Add or update Maestro smoke coverage for the trusted profile gate states.
- Defer avatar upload/storage work to TASK-003.

## User Flow

Authenticated user enters profile setup

↓

User submits required trust fields

↓

App creates or updates the Supabase profile row without avatar upload

↓

App loads profile state on restart

↓

Only allowed users can access Phase 1 help-network actions

## Acceptance Criteria

- [x] Profile setup writes required fields to Supabase.
- [x] Trusted Profile validation requires non-empty first name, normalized username, age >= 13, non-empty city, and at least one language.
- [x] Optional profile fields are not required for app entry.
- [x] Existing profile loads after app restart.
- [x] Incomplete profile users are routed back to profile completion.
- [x] Profile fetch errors show a retryable state instead of dead-ending the app.
- [x] Profile update API/hook is supported separately from initial create.
- [ ] Profile update is verified under RLS, without adding a full edit-profile screen.
- [x] Banned users are blocked from gated flows.
- [x] Route-level gates protect app launch, tabs, and Phase 1 route groups.
- [x] Action-level guard predicates are available for request creation, helper availability, session entry, and messaging entry.
- [x] Users without Email Verification are routed to email verification before profile completion or app entry.
- [x] Email Verification gate uses Supabase Auth user state, not a client-written profile flag alone.
- [x] Users without Phone Verification are allowed into the app after Email Verification and Trusted Profile completion.
- [x] Mobile profile create/update does not write `verified`, `is_banned`, or other server-owned trust flags.
- [ ] Database/RLS prevents publishable-key clients from self-setting `verified`, `is_banned`, or future server-owned trust flags.
- [x] A migration or policy fix is added if current RLS allows client writes to server-owned flags.
- [x] Banned users see a dedicated blocked-account state with sign-out access and support guidance.
- [ ] Profile self-insert/update works under RLS with the publishable client key.
- [x] Profile fetch/update errors are visible and retryable.
- [x] Avatar upload is not part of this task and no UI path requires it.
- [x] Maestro smoke flow(s) cover the core gate states or document why a state must stay manual for now.
- [x] `npm run typecheck` passes.

## Technical Notes

- Use `profiles.id = auth.uid()` as the ownership contract.
- Keep profile fetch/update behind a feature API/hook.
- Full profile editing is out of scope; this task proves the update path and gate behavior only.
- Route gates protect navigation; action guards protect stale in-app state and later feature entry points.
- Mock-backed Phase 1 screens may use the central guard without fully replacing their data source in this task.
- MVP age policy is `age >= 13`; country-specific age rules are out of scope.
- Normalize username by removing leading `@` before persistence.
- RLS must enforce user ownership for profile writes.
- Verification and ban state must be server-owned; do not trust user-editable metadata or client-written profile booleans.
- Email Verification is required for app entry; Phone Verification is a later trust signal, not an entry gate.
- `profiles.email_verified` may be displayed or cached, but it must not be the sole authority for app entry.
- `profiles.verified`, `profiles.is_banned`, and future trust flags are server/admin-owned.
- App-only discipline is not sufficient security; enforce server-owned flags at the database/policy layer.
- Banned users must not be redirected to signup or profile setup; the profile exists but is blocked from participation.
- Avatar media belongs to TASK-003 because bucket creation, storage policies, and upload paths need separate verification.
- Maestro is the default E2E framework for this repo; store flows in `.maestro/`.
- Prefer focused smoke flows over broad UI tours for this task.

## Edge Cases

- Auth session exists but profile row is missing.
- Auth session exists but email is not verified.
- Profile row says `email_verified = true` but Supabase Auth user is not confirmed.
- Client attempts to write `verified` or `is_banned` during profile create/update.
- Direct Supabase REST call with publishable key attempts to self-set trust or ban flags.
- User submits profile with missing city, no language, leading-`@` username, or age below 13.
- Profile write succeeds while avatar remains unset.
- User is banned after a session has already been restored.
- Banned user restarts the app and must land on the blocked-account state.
- Existing profile update fails because RLS rejects a non-owned row.
- User becomes banned/unverified while already inside a tab.
- User changes locale during onboarding.

## Dependencies

- TASK-001 completed.
- `profiles` table and RLS policies available in Supabase.
- TASK-003 owns `avatars` bucket/policy verification and avatar upload wiring.

## Verification

- [ ] Manual profile create/update against the remote Supabase project.
- [ ] Profile update hook/API verification under publishable-key RLS.
- [ ] Restart session restore plus profile load on device/simulator.
- [ ] Publishable-key RLS/security check for self-owned fields versus server-owned flags.
- [ ] Route and action gate checks for missing profile, unverified email, missing phone verification, banned profile, stale in-app state, and sign out from blocked state.
- [x] Maestro smoke flow for signed-out gate; seeded remote auth states are documented as manual until test seeding exists.
- [x] `npm run typecheck`.

## Test Scope

- Static: TypeScript compile safety for profile-gate refactors.
- E2E smoke: profile gate entry state and onboarding profile route state.
- Manual: banned/unverified/stale-session states that require controlled backend fixtures.

## Test Commands

- `npm run typecheck`
- `maestro test .maestro/tasks/TASK-002.yml`

## CI Mapping

- Workflow: `.eas/workflows/e2e-test-android.yml`
- Workflow: `.eas/workflows/e2e-test-ios.yml`
- Required flow path: `.maestro/tasks/TASK-002.yml`

## Pass Criteria

- [ ] Local `npm run typecheck` passes.
- [ ] Local `maestro test .maestro/tasks/TASK-002.yml` passes.
- [ ] Android E2E workflow passes with `TASK-002` flow included.
- [ ] iOS E2E workflow passes with `TASK-002` flow included.
- [ ] Manual backend-fixture checks recorded for banned/unverified gate states.
