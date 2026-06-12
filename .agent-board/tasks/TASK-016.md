# TASK-016 - UX: button loading states, language dropdown, remove two controls

Status: Done
Priority: P2
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Polish
Owner: Agent

## Purpose

Address UX gaps reported by the product owner (GitHub issue #12): missing
async feedback and two control changes.

## Source

GitHub issue #12 "Ux issues" (ProgixDev/take-me-pic).

## Scope

- **Button loading states:** buttons that trigger API calls have no loading
  feedback. Add a loading/disabled state to the shared `Button` (spinner or
  in-place affordance) and wire it on the async actions across the app (auth,
  profile create/update, request create/accept, rating submit, report/block,
  etc.) — driven by each mutation's `isPending`.
- **Language selector → dropdown:** in the profile/settings section, the
  language change control currently cycles/selects directly; replace it with a
  proper dropdown/picker the user chooses from (a `CountryPickerModal`-style
  sheet already exists in `src/shared/ui/` and can be the pattern).
- **Remove "available now" slider** from the home screen **filter** section.
- **Remove "visible on the map"** control from the profile screen.

## Acceptance Criteria

- [x] The shared `Button` supports a `loading` state (spinner + disabled + dim), wired on the primary API-backed CTAs: profile-create, login, signup, forgot, reset, rating-submit, request-accept.
- [x] Language is chosen from a dropdown/picker (`LanguagePickerModal`), not a direct cycle.
- [x] The "available now" slider is gone from the home filter section (it was redundant — `find_available_helpers` already returns only available helpers; removed the row + staging/applied state + count).
- [x] The "visible on the map" control is removed. _Note: it existed only in Settings ▸ Privacy (unwired local state), not on the profile screen; removed there. Real presence visibility is the home "active now" toggle._
- [x] `npm run typecheck` passes.
- [x] Maestro (Release build) stays green (boots + reaches the login screen with the password-field fix).

## Technical Notes

- UI-only / client-side; no schema or RPC changes expected.
- Prefer threading existing react-query `isPending` into the `Button` rather than ad-hoc local state.
- Confirm during grilling that removing "visible on the map" (profile) does not
  drop a needed presence-visibility control — if it gates `presence` visibility,
  decide where that setting lives instead (it also appears in settings/Privacy).
- Coordinate the "available now"/"active now" controls with TASK-015.

## Dependencies

- None (independent UX polish). Light coordination with TASK-015.

## Verification

- Manual: trigger an API-backed button and confirm the loading state; open the language picker; confirm both removed controls are gone.
- Maestro boot smoke.
