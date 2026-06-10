# TASK-003 - Verify Avatar Storage and Profile Media Upload

Status: Backlog
Priority: P0
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Auth first
Owner: Agent

## Purpose

Verify and wire avatar upload so trusted profiles can include a user-owned photo without exposing private storage paths or requiring service-role access.

## Scope

- Verify the `avatars` storage bucket exists in Supabase.
- Configure `avatars` as a public bucket because profile avatars are intentionally visible on profiles and helper pins.
- Verify storage policies allow authenticated users to upload and update only their own avatar path.
- Add or complete avatar upload helper behind the existing Supabase storage module.
- Wire profile setup/edit flow to upload avatar and persist `profiles.avatar_url`.
- Keep avatar optional until storage policy verification is complete.
- Keep private session-photo storage out of this task; TASK-007 owns `session-photos`.

## User Flow

Authenticated user selects avatar

.

App uploads to user-owned avatar path

.

Profile row stores the public avatar reference

.

Profile and helper pins can render the avatar

## Acceptance Criteria

- [ ] Avatar upload works with the publishable client key.
- [ ] User cannot overwrite another user's avatar path.
- [ ] Public avatar reads work without exposing write access.
- [ ] Profile write stores the avatar reference after upload succeeds.
- [ ] Avatar upload failure does not create a partially broken trusted profile.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/004-auth-onboarding/spec.md`, `docs/features/phase_1/onboarding_profile_verification_flow.md`.
- Use Supabase Storage; do not expose service-role keys.
- Use public `avatars` bucket reads for profile display.
- Use user-owned paths such as `{auth.uid()}/avatar.<ext>` or `{auth.uid()}/{uuid}.jpg`.
- Storage policies must restrict insert/update/delete to the authenticated user's own top-level path.
- Do not apply this public-bucket decision to session photos; session photos stay private and party-scoped.

## Dependencies

- TASK-002 completed.
- Remote storage bucket and policies verified.

## Verification

- Manual upload/update path.
- RLS/storage policy check for another user's path.
- Typecheck.
