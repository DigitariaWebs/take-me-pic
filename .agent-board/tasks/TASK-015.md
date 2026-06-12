# TASK-015 - UI fixes: input alignment, keyboard overlap, active toggle

Status: Backlog
Priority: P2
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Polish
Owner: Agent

## Purpose

Fix three concrete UI defects reported by the product owner (GitHub issue #11)
that hurt usability of the auth/onboarding and home screens.

## Source

GitHub issue #11 "Ui issues" (ProgixDev/take-me-pic).

## Scope

- **Password field icon alignment:** the show/hide (visibility) icon in password
  input fields is not vertically aligned with the field. Align it within the
  field (login, signup, reset/forgot password screens — wherever the password
  Field is used).
- **Keyboard overlaps bio field (signup step 3):** on the profile-setup screen
  ("profile" / step 3 of signup), the "trois mots sur moi" (bio) field is hidden
  behind the keyboard when focused. Ensure the field scrolls into view above the
  keyboard (keyboard-aware scroll / `scrollToFocusedInput` / proper
  `KeyboardAvoidingView` offset).
- **"Active now" toggle on the home screen:** the active/inactive control does
  not read as a toggle/slider. Restyle it (layout and/or colors) so its on/off
  state is visually obvious. (Coordinate with TASK-016, which removes the
  "available now" slider from the home **filter** section — confirm these are
  distinct controls during grilling.)

## Acceptance Criteria

- [ ] Password visibility icon is vertically centered/aligned in all password fields.
- [ ] The signup step-3 bio field is fully visible (not covered by the keyboard) when focused.
- [ ] The home "active now" control clearly reads as an on/off toggle in both states.
- [ ] `npm run typecheck` passes.
- [ ] Maestro boot smoke (Release build) stays green.

## Technical Notes

- UI-only / client-side; no schema or RPC changes expected.
- Reuse the shared `Field` component for the icon fix so every password field benefits.
- Grilling should pin down exact screens and whether the "active now" (home) and
  "available now" (filter) controls overlap with TASK-016.

## Dependencies

- None (independent UI polish).

## Verification

- Manual: focus each password field; focus the bio field on signup step 3 with the keyboard up; toggle the home active control.
- Maestro boot smoke.
